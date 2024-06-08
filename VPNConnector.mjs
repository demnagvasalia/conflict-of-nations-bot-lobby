import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { getRandomFile, getRandomCredentialsFile } from "./utils/randomUtil.mjs";

class VPNConnector extends EventEmitter {
    constructor() {
        super();
    }

    connectToRandomVPN() {
        const vpnDirectory = './protonfiles';
        fs.readdir(vpnDirectory, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                this.emit("error", err);
                return;
            }

            const ovpnFiles = files.filter(file => path.extname(file) === '.ovpn');
            if (ovpnFiles.length === 0) {
                console.error('No .ovpn files found in directory:', vpnDirectory);
                this.emit("error", new Error('No .ovpn files found'));
                return;
            }

            const randomOvpnFile = getRandomFile(ovpnFiles);
            const ovpnPath = path.join(vpnDirectory, randomOvpnFile);
            const credentialsFile = getRandomCredentialsFile();
            const credentialsPath = path.join(vpnDirectory + "/credentials", credentialsFile);

            console.log(`Logging in with ${credentialsFile}`);

            const command = `openvpn --config "${ovpnPath}" --auth-user-pass "${credentialsPath}" --auth-nocache`;
            console.log('Connecting to VPN with command:', command);
            const childProcess = exec(command);

            childProcess.stdout.on('data', (data) => {
                console.log(data.toString());
                if (data.toString().includes("Initialization Sequence Completed")) {
                    this.emit("connected");
                }
            });

            childProcess.stderr.on('data', (data) => {
                console.error(data.toString());
                this.emit("error", new Error(data.toString()));
            });
        });
    }
}

export default VPNConnector;
