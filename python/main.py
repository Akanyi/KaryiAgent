#!/usr/bin/env python3
"""
KaryiAgent - Python Entry Point
================================

This is the main entry point for the Python backend of KaryiAgent.
It listens for JSON-RPC requests from the Node.js frontend via stdin/stdout.

Usage:
    python main.py

The script expects to receive JSON-RPC 2.0 requests on stdin and will respond
with JSON-RPC 2.0 responses on stdout.
"""

import sys
import json
import logging
from typing import Dict, Any, Optional

# Configure logging to stderr (stdout is reserved for JSON-RPC)
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)


class JSONRPCBridge:
    """
    JSON-RPC 2.0 Bridge for communication with Node.js frontend.
    
    Handles incoming requests and routes them to appropriate handlers.
    """
    
    def __init__(self):
        self.handlers: Dict[str, Any] = {}
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Register all available RPC method handlers."""
        self.handlers = {
            'ping': self.handle_ping,
            'echo': self.handle_echo,
            # Future handlers will be added here:
            # 'ai.chat': self.handle_ai_chat,
            # 'file.read': self.handle_file_read,
            # 'file.edit': self.handle_file_edit,
            # 'scan.project': self.handle_scan_project,
        }
    
    def handle_ping(self, params: Optional[Dict[str, Any]] = None) -> str:
        """Handle ping request for testing connectivity."""
        return "pong"
    
    def handle_echo(self, params: Optional[Dict[str, Any]] = None) -> Any:
        """Echo back the received parameters."""
        return params
    
    def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a JSON-RPC 2.0 request.
        
        Args:
            request: JSON-RPC request object
            
        Returns:
            JSON-RPC response object
        """
        request_id = request.get('id')
        method = request.get('method')
        params = request.get('params')
        
        # Validate request
        if not method:
            return self._error_response(request_id, -32600, "Invalid Request: missing method")
        
        # Find handler
        handler = self.handlers.get(method)
        if not handler:
            return self._error_response(request_id, -32601, f"Method not found: {method}")
        
        # Execute handler
        try:
            result = handler(params)
            return self._success_response(request_id, result)
        except Exception as e:
            logger.exception(f"Error handling method {method}")
            return self._error_response(request_id, -32603, f"Internal error: {str(e)}")
    
    def _success_response(self, request_id: Any, result: Any) -> Dict[str, Any]:
        """Create a JSON-RPC success response."""
        return {
            'jsonrpc': '2.0',
            'id': request_id,
            'result': result
        }
    
    def _error_response(self, request_id: Any, code: int, message: str) -> Dict[str, Any]:
        """Create a JSON-RPC error response."""
        return {
            'jsonrpc': '2.0',
            'id': request_id,
            'error': {
                'code': code,
                'message': message
            }
        }
    
    def run(self):
        """
        Main loop: read JSON-RPC requests from stdin, process, and respond via stdout.
        """
        logger.info("KaryiAgent Python Engine started")
        logger.info("Listening for JSON-RPC requests on stdin...")
        
        try:
            for line in sys.stdin:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    # Parse JSON-RPC request
                    request = json.loads(line)
                    logger.debug(f"Received request: {request.get('method')}")
                    
                    # Process request
                    response = self.process_request(request)
                    
                    # Send response to stdout
                    print(json.dumps(response), flush=True)
                    logger.debug(f"Sent response for: {request.get('method')}")
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON received: {e}")
                    error_response = self._error_response(None, -32700, "Parse error")
                    print(json.dumps(error_response), flush=True)
                
                except Exception as e:
                    logger.exception("Unexpected error processing request")
                    error_response = self._error_response(None, -32603, f"Internal error: {str(e)}")
                    print(json.dumps(error_response), flush=True)
        
        except KeyboardInterrupt:
            logger.info("Received interrupt signal, shutting down...")
        
        except Exception as e:
            logger.exception("Fatal error in main loop")
            sys.exit(1)
        
        finally:
            logger.info("KaryiAgent Python Engine stopped")


def main():
    """Main entry point."""
    bridge = JSONRPCBridge()
    bridge.run()


if __name__ == '__main__':
    main()
