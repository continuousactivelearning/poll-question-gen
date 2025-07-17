// Helper function to extract JSON from markdown code blocks
function extractJSONFromMarkdown(text: string): string {
  let cleanText = text.trim();

  // Use regex to remove ```json ... ``` or ``` ... ```
  const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const match = cleanText.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: remove leading/trailing ```
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  return cleanText.trim();
}

// Enhanced version with better error handling and JSON repair
function extractAndValidateJSON(text: string): { success: boolean; data: any; error?: string } {
  try {
    const extractedJSON = extractJSONFromMarkdown(text);
    
    // Try to parse the extracted JSON
    const parsed = JSON.parse(extractedJSON);
    return { success: true, data: parsed };
  } catch (error) {
    // If parsing fails, try to repair common JSON issues
    try {
      const repairedJSON = repairCommonJSONIssues(extractJSONFromMarkdown(text));
      const parsed = JSON.parse(repairedJSON);
      return { success: true, data: parsed };
    } catch (repairError) {
      return { 
        success: false, 
        data: null, 
        error: `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Function to repair common JSON issues
function repairCommonJSONIssues(jsonString: string): string {
  let repaired = jsonString;
  
  // Fix common issues that might cause parsing to fail
  
  // 1. Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // 2. Add missing closing brackets/braces
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  
  // Add missing closing brackets
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  
  // Add missing closing braces
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }
  
  // 3. Fix unescaped quotes in strings (basic attempt)
  // This is tricky and might not cover all cases
  repaired = repaired.replace(/([^\\])"([^"]*)"([^,}\]\s])/g, '$1"$2\\"$3');
  
  // 4. Remove any text after the last valid JSON structure
  const lastBrace = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
  if (lastBrace !== -1) {
    repaired = repaired.substring(0, lastBrace + 1);
  }
  
  return repaired;
}

// Function specifically for handling transcript segmentation responses
function parseTranscriptSegments(response: string): Array<{
  end_time: string;
  transcript_lines: string[];
}> {
  const result = extractAndValidateJSON(response);
  
  if (!result.success) {
    console.warn('Failed to parse transcript segments:', result.error);
    console.warn('Raw response preview:', response.substring(0, 200) + '...');
    
    // Fallback: try to extract segments manually
    return createFallbackSegments(response);
  }
  
  // Validate the structure
  if (!Array.isArray(result.data)) {
    console.warn('Parsed data is not an array, using fallback');
    return createFallbackSegments(response);
  }
  
  // Validate each segment has required fields
  const validSegments = result.data.filter(segment => 
    segment.end_time && 
    segment.transcript_lines && 
    Array.isArray(segment.transcript_lines)
  );
  
  if (validSegments.length === 0) {
    console.warn('No valid segments found, using fallback');
    return createFallbackSegments(response);
  }
  
  return validSegments;
}

// Fallback function to create segments from raw text
function createFallbackSegments(text: string): Array<{
  end_time: string;
  transcript_lines: string[];
}> {
  // Extract timestamp patterns from the text
  const timestampRegex = /(\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}\.\d{3}):\s*(.+)/g;
  const segments: Array<{ end_time: string; transcript_lines: string[] }> = [];
  let match;
  
  while ((match = timestampRegex.exec(text)) !== null) {
    const [, startTime, endTime, content] = match;
    segments.push({
      end_time: endTime,
      transcript_lines: [`${startTime} --> ${endTime}: ${content.trim()}`]
    });
  }
  
  // If no timestamp patterns found, create a single segment
  if (segments.length === 0) {
    segments.push({
      end_time: "00:00.000",
      transcript_lines: [text.substring(0, 100) + "..."]
    });
  }
  
  return segments;
}

export { 
  extractJSONFromMarkdown, 
  extractAndValidateJSON, 
  repairCommonJSONIssues,
  parseTranscriptSegments 
};