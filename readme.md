# Vultr Dns Update

This is a node js script to update your current ip address to Vultr DNS record. It can provide Dynamic DNS service for your locally hosted (Wamp/Xamp) sites.

### Usage

- Clone this repo.
- Run `npm install`.
- Create `.env` file in the directory.
- Run `node updateDns.js`

### Dot env example

```.env
VULTR_API_KEY="..."
VULTR_DOMAIN="example.com"
VULTR_SUBDOMAINS=["dev1", "dev2", "dev3"]
ISP_NAME="AS134749 SPEED TECH ONLINE"
```

You can find your isp asn & name from ipinfo - https://ipinfo.io/ (**org** parameter)

### Automation On Windows

Windows user can add the `updateDns.js` file on windows scheduled task.
This will update your local ip to vultr Dns everytime you connect (disconnect/reconnect) to the internet.

- Under **Triggers**, add new event.
- Select Settings `Basic`.
- Select Log: `Microsoft-Windows-NetwordProfile/Operational`
- Source: `NetworkProfile`
- Event ID: 10000
- Under **Actions**, click new.
- Start a program
- Browse & select the `"C:\Program Files\nodejs\node.exe"` file.
- Add Arguments: `updateDns.js`
- Start In: `{FOLDER_PATH_OF_THIS_CLONNED_REPO}`
