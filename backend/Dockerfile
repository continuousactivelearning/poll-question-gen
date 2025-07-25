# Use Node 18 as base
FROM node:18

# Enable Corepack & set working directory
RUN corepack enable
WORKDIR /app



# Copy backend files
COPY . .
# Add this right after setting WORKDIR
\

# Install dependencies
RUN pnpm install

# Build TypeScript
RUN pnpm build

# Start server
CMD ["node", "build/index.js"]
