"""
🍄 Datanyx Project - Start All Services
========================================

This script starts all the required services:
1. ML API Server (Python Flask - port 3002)
2. Chatbot Backend Server (Node.js Express - port 3001)
3. Frontend Dev Server (Vite - port 5173)
4. Ollama (if not running)

Usage:
    python start_all.py
    python start_all.py --no-frontend  # Skip frontend
    python start_all.py --no-ollama    # Skip Ollama check
"""

import subprocess
import sys
import os
import time
import socket
import signal
import argparse
from pathlib import Path

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.absolute()

# Service configurations
SERVICES = {
    "ml_api": {
        "name": "🧠 ML Yield Predictor",
        "port": 3002,
        "cwd": PROJECT_ROOT / "Backend" / "ML model",
        "cmd_windows": ["python", "ml_api.py"],
        "cmd_unix": ["python3", "ml_api.py"],
        "health_url": "http://localhost:3002/api/health"
    },
    "chatbot_backend": {
        "name": "🍄 Chatbot Backend",
        "port": 3001,
        "cwd": PROJECT_ROOT / "Backend" / "server",
        "cmd_windows": ["npm", "run", "dev"],
        "cmd_unix": ["npm", "run", "dev"],
        "health_url": "http://localhost:3001/api/health"
    },
    "frontend": {
        "name": "🌐 Frontend (AWS_test)",
        "port": 5173,
        "cwd": PROJECT_ROOT / "AWS_test",
        "cmd_windows": ["npm", "run", "dev"],
        "cmd_unix": ["npm", "run", "dev"],
        "health_url": "http://localhost:5173"
    }
}

# Track running processes for cleanup
running_processes = []


def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


def check_ollama() -> bool:
    """Check if Ollama is running"""
    try:
        import urllib.request
        req = urllib.request.Request("http://localhost:11434/api/tags")
        with urllib.request.urlopen(req, timeout=2) as response:
            return response.status == 200
    except:
        return False


def start_ollama():
    """Start Ollama server"""
    print("\n📦 Starting Ollama...")
    try:
        if sys.platform == "win32":
            # On Windows, start Ollama in background
            subprocess.Popen(
                ["ollama", "serve"],
                creationflags=subprocess.CREATE_NEW_CONSOLE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            subprocess.Popen(
                ["ollama", "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        time.sleep(3)
        if check_ollama():
            print("✅ Ollama started successfully")
            return True
        else:
            print("⚠️  Ollama may not have started correctly")
            return False
    except FileNotFoundError:
        print("❌ Ollama not found. Please install Ollama from https://ollama.ai")
        return False
    except Exception as e:
        print(f"❌ Failed to start Ollama: {e}")
        return False


def start_service(service_key: str, config: dict) -> subprocess.Popen | None:
    """Start a service and return its process"""
    name = config["name"]
    port = config["port"]
    cwd = config["cwd"]
    
    # Check if port is already in use
    if is_port_in_use(port):
        print(f"⚠️  {name} - Port {port} already in use (service may be running)")
        return None
    
    # Check if directory exists
    if not cwd.exists():
        print(f"❌ {name} - Directory not found: {cwd}")
        return None
    
    # Get the appropriate command
    cmd = config["cmd_windows"] if sys.platform == "win32" else config["cmd_unix"]
    
    print(f"🚀 Starting {name} on port {port}...")
    
    try:
        # Start the process
        if sys.platform == "win32":
            process = subprocess.Popen(
                cmd,
                cwd=str(cwd),
                creationflags=subprocess.CREATE_NEW_CONSOLE,
                shell=True
            )
        else:
            process = subprocess.Popen(
                cmd,
                cwd=str(cwd),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        
        return process
    except Exception as e:
        print(f"❌ Failed to start {name}: {e}")
        return None


def wait_for_service(port: int, timeout: int = 30) -> bool:
    """Wait for a service to be available on a port"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_port_in_use(port):
            return True
        time.sleep(0.5)
    return False


def cleanup(signum=None, frame=None):
    """Clean up running processes on exit"""
    print("\n\n🛑 Shutting down services...")
    for proc in running_processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except:
            try:
                proc.kill()
            except:
                pass
    print("👋 All services stopped. Goodbye!")
    sys.exit(0)


def print_banner():
    """Print startup banner"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║                  🍄 DATANYX PROJECT                        ║
║              Mushroom Cultivation Assistant                ║
╠═══════════════════════════════════════════════════════════╣
║  Services:                                                 ║
║  • ML Yield Predictor   - http://localhost:3002           ║
║  • Chatbot Backend      - http://localhost:3001           ║
║  • Frontend             - http://localhost:5173           ║
║  • Ollama LLM           - http://localhost:11434          ║
╚═══════════════════════════════════════════════════════════╝
    """)


def main():
    parser = argparse.ArgumentParser(description="Start all Datanyx services")
    parser.add_argument("--no-frontend", action="store_true", help="Skip frontend server")
    parser.add_argument("--no-ollama", action="store_true", help="Skip Ollama check")
    args = parser.parse_args()
    
    # Register signal handlers for cleanup
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    print_banner()
    
    # Check/start Ollama
    if not args.no_ollama:
        if check_ollama():
            print("✅ Ollama is already running")
        else:
            start_ollama()
    else:
        print("⏭️  Skipping Ollama check")
    
    # Start ML API
    ml_proc = start_service("ml_api", SERVICES["ml_api"])
    if ml_proc:
        running_processes.append(ml_proc)
        time.sleep(2)  # Give it time to start
    
    # Start Chatbot Backend
    backend_proc = start_service("chatbot_backend", SERVICES["chatbot_backend"])
    if backend_proc:
        running_processes.append(backend_proc)
        time.sleep(2)
    
    # Start Frontend (unless skipped)
    if not args.no_frontend:
        frontend_proc = start_service("frontend", SERVICES["frontend"])
        if frontend_proc:
            running_processes.append(frontend_proc)
    else:
        print("⏭️  Skipping frontend server")
    
    # Wait for services to be ready
    print("\n⏳ Waiting for services to be ready...")
    time.sleep(3)
    
    # Check service status
    print("\n📊 Service Status:")
    print("-" * 50)
    
    services_to_check = [
        ("ML API", 3002),
        ("Chatbot Backend", 3001),
        ("Ollama", 11434),
    ]
    if not args.no_frontend:
        services_to_check.append(("Frontend", 5173))
    
    all_ok = True
    for name, port in services_to_check:
        if is_port_in_use(port):
            print(f"  ✅ {name:20} - Running on port {port}")
        else:
            print(f"  ❌ {name:20} - Not responding on port {port}")
            all_ok = False
    
    print("-" * 50)
    
    if all_ok:
        print("\n🎉 All services are running!")
        print("\n👉 Open http://localhost:5173/#/chatbot in your browser")
        print("\n💡 Press Ctrl+C to stop all services\n")
    else:
        print("\n⚠️  Some services may not have started correctly")
        print("   Check the individual terminal windows for errors")
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()



