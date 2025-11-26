# 🧩 LEGENT vLEI SETUP

This document provides a **complete step-by-step guide** to set up, clean, and deploy the **LEGENT VLEI SETUP** using **Docker** on **Ubuntu / WSL2**.

![WhatsApp Image 2025-11-25 at 14 01 30_ad53eee8](https://github.com/user-attachments/assets/158b6507-0e5a-4eef-a788-bd8764030c12)

youtube link for reference:
https://www.youtube.com/watch?v=tgHEHFWF9Wc&t=2s

reference materials:
https://drive.google.com/drive/folders/1OSrtbgRJGEFIHHs2f-egqZo9dflh05jW

## ⚙️ Prerequisites

Ensure the following are installed before proceeding:
- **Docker** and **Docker Compose**
- **Git**
- **WSL2 (Ubuntu)** if using Windows

## Steps to setup VLEI Infrastructure
## 🏗️ Step 1: Create Project Workspace and Copy Files

```bash
# Create a 'projects' folder in your home directory
mkdir -p ~/projects

# Copy the vLEI Hackathon project from your Windows folder into your Linux workspace

#cp -r /mnt/c/CHAINAIM3003/mcp-servers/vLEINew1/vlei-hackathon-2025-workshop-master ~/projects/
cp -r <YOUR LOCAL DIRECTORY>/vLEINew1/vlei-hackathon-2025-workshop-master ~/projects/<YOUR DESTINATION DIE>

(subject to change according to your windows file system location of the directory)

# Navigate to the working directory
#cd ~/projects/vLEIWorkLinux1

cd ~/projects/<YOUR DESTINATION DIRECTORY>


🧰 Step 2: Install Required Tools
sudo apt update
sudo apt install dos2unix

🧹 Step 3: Fix Line Endings in Shell Scripts
find . -type f -name "*.sh" -exec dos2unix {} \;

🔑 Step 4: Make All Shell Scripts Executable
chmod +x *.sh
chmod +x scripts/*.sh 2>/dev/null
chmod +x */*.sh 2>/dev/null

📦 Step 5: Install jq JSON Processor
sudo apt update
sudo apt install jq -y

🧽 Step 6: Stop, Clean, Rebuild, and Deploy
# Stop any existing containers or services
./stop.sh

# Remove unused Docker containers, images, and networks
docker system prune -f

# Rebuild Docker images without cache for a fresh setup
docker compose build --no-cache

# Deploy the environment
./deploy.sh

🚀 Step 7: Run the Full vLEI Workflow
./run-all.sh

./run-all-buyerseller-2-with-agents.sh   


./test-agent-verification-DEEP.sh

## Steps to setup API Server
Navigate to ~/projects/LEGENT/algoTITANV5/LegentvLEI/api-server (subject to change according to your path)

Navigate to ~/projects/<YOUR DESTINATTION DIRECTORY>/LegentvLEI/api-server (subject to change according to your path)


Run : npm install
Run : node server.js

# A2A Servers Setup Guide

This guide will help you set up and run the A2A (Agent-to-Agent) buyer and seller servers.

## Prerequisites

- Node.js installed on your system
- npm (Node Package Manager)

## Installation

1. Navigate to the JavaScript directory:
```bash
cd js
```

2. Install dependencies:
```bash
npm install
```

## Running the Servers

The A2A system requires two separate servers to be running simultaneously: the buyer agent and the seller agent.

### Starting the Buyer Agent

<YOUR DIR>\algoTITANV6\Legent\A2A\js\src\agents\buyer-agent


In your first terminal:

```bash
cd js
npm run agents:buyer
```

### Starting the Seller Agent

<YOUR DIR>\algoTITANV6\Legent\A2A\js\src\agents\seller-agent

In a second terminal:

```bash
cd js
npm run agents:seller
```

## Accessing the Servers

Once both servers are running, they will be available at their respective endpoints. Check the terminal output for the specific URLs where each agent is listening.

## Troubleshooting

- **Port conflicts**: If you encounter port conflicts, ensure no other services are running on the required ports
- **Installation errors**: Try deleting the `node_modules` folder and `package-lock.json`, then run `npm install` again
- **Missing dependencies**: Ensure you're running `npm install` from the correct `js` directory

## Stopping the Servers

To stop either server, press `Ctrl+C` in the respective terminal window.

---

Within Legent

#Navigate to //wsl.localhost/Ubuntu/home/deepitha/projects/LEGENT/algoTITANV6/Legent/UI

Navigate to //<YOUR DIR/LEGENT/algoTITANV6/Legent/UI


npm install
npm run dev 

The application should open up in localhost:3000

Instructions :
On the Buyer Agent chat window, type "fetch my agent" followed by "fetch seller agent"
On the Seller Agent chat window, type "fetch my agent" followed by "fetch buyer agent"

This will start the mutual cross verification or proof of delegation of the agents.

#Navigate to /home/deepitha/projects/LEGENT/algoTITANV6/Legent/Frontend2/UI
Navigate to <YOUR DIR>/LEGENT/algoTITANV6/Legent/Frontend2/UI

npm install
npm run dev

Repeat the same steps :
On the Buyer Agent chat window, type "fetch my agent" followed by "fetch seller agent"
On the Seller Agent chat window, type "fetch my agent" followed by "fetch buyer agent"


From the Seller side, "Send Invoice"






