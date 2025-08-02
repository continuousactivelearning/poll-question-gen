import os
import shutil
import logging
from pathlib import Path
from typing import List, Optional, Union

logger = logging.getLogger(__name__)

class CleanupService:
    """Service for cleaning up temporary files and directories"""
    
    async def cleanup(self, paths: List[Optional[Union[str, Path]]]) -> None:
        """
        Asynchronously deletes a list of files or directories.
        Logs errors for individual deletions but does not throw an error
        if a specific file/directory deletion fails, attempting to clean up all provided paths.
        
        Args:
            paths: List of paths to files or directories. None entries are ignored.
        """
        if not paths or len(paths) == 0:
            logger.info('CleanupService: No paths provided for cleanup.')
            return
        
        # Filter out None/empty paths
        valid_paths = [str(p) for p in paths if p]
        
        if not valid_paths:
            logger.info('CleanupService: No valid paths provided for cleanup.')
            return
        
        logger.info(f'CleanupService: Starting cleanup for paths: {valid_paths}')
        
        for path_str in valid_paths:
            try:
                path = Path(path_str)
                
                # Check if path exists
                if not path.exists():
                    logger.info(f'CleanupService: Path not found, presumed already cleaned up: {path_str}')
                    continue
                
                # Determine if it's a file or directory
                if path.is_dir():
                    # Remove directory and all contents
                    shutil.rmtree(path)
                    logger.info(f'CleanupService: Successfully deleted directory: {path_str}')
                elif path.is_file():
                    # Remove file
                    path.unlink()
                    logger.info(f'CleanupService: Successfully deleted file: {path_str}')
                else:
                    logger.warning(f'CleanupService: Unknown path type: {path_str}')
                    
            except FileNotFoundError:
                logger.info(f'CleanupService: Path not found, presumed already cleaned up: {path_str}')
            except PermissionError as e:
                logger.error(f'CleanupService: Permission denied deleting path {path_str}: {str(e)}')
            except OSError as e:
                logger.error(f'CleanupService: OS error deleting path {path_str}: {str(e)}')
            except Exception as e:
                logger.error(f'CleanupService: Unexpected error deleting path {path_str}: {str(e)}')
        
        logger.info('CleanupService: Finished cleanup process.')
    
    async def cleanup_single(self, path: Optional[Union[str, Path]]) -> bool:
        """
        Clean up a single file or directory
        
        Args:
            path: Path to file or directory to clean up
            
        Returns:
            bool: True if cleanup was successful, False otherwise
        """
        if not path:
            return True
        
        try:
            await self.cleanup([path])
            return True
        except Exception as e:
            logger.error(f'CleanupService: Failed to cleanup {path}: {str(e)}')
            return False
    
    def cleanup_sync(self, paths: List[Optional[Union[str, Path]]]) -> None:
        """
        Synchronous version of cleanup for non-async contexts
        
        Args:
            paths: List of paths to files or directories. None entries are ignored.
        """
        if not paths or len(paths) == 0:
            logger.info('CleanupService: No paths provided for cleanup.')
            return
        
        # Filter out None/empty paths
        valid_paths = [str(p) for p in paths if p]
        
        if not valid_paths:
            logger.info('CleanupService: No valid paths provided for cleanup.')
            return
        
        logger.info(f'CleanupService: Starting sync cleanup for paths: {valid_paths}')
        
        for path_str in valid_paths:
            try:
                path = Path(path_str)
                
                # Check if path exists
                if not path.exists():
                    logger.info(f'CleanupService: Path not found, presumed already cleaned up: {path_str}')
                    continue
                
                # Determine if it's a file or directory
                if path.is_dir():
                    # Remove directory and all contents
                    shutil.rmtree(path)
                    logger.info(f'CleanupService: Successfully deleted directory: {path_str}')
                elif path.is_file():
                    # Remove file
                    path.unlink()
                    logger.info(f'CleanupService: Successfully deleted file: {path_str}')
                else:
                    logger.warning(f'CleanupService: Unknown path type: {path_str}')
                    
            except FileNotFoundError:
                logger.info(f'CleanupService: Path not found, presumed already cleaned up: {path_str}')
            except PermissionError as e:
                logger.error(f'CleanupService: Permission denied deleting path {path_str}: {str(e)}')
            except OSError as e:
                logger.error(f'CleanupService: OS error deleting path {path_str}: {str(e)}')
            except Exception as e:
                logger.error(f'CleanupService: Unexpected error deleting path {path_str}: {str(e)}')
        
        logger.info('CleanupService: Finished sync cleanup process.')