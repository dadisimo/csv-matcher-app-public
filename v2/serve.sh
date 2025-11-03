#!/bin/bash
# Simple development server for testing the CSV Matcher app
# This is needed because ES6 modules require HTTP protocol

echo "🚀 Starting development server..."
echo "📂 Serving files from: $(pwd)"
echo "🌐 Open your browser at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8080
