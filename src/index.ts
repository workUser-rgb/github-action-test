import * as core from '@actions/core';
import axios from 'axios';

async function run() {
    try {
        const token = core.getInput('zt_token', { required: true });

        core.info(`Initiating security scan request`);

        // Initiate the scan
        const initiateResponse = await axios.post(`https://api.zerothreat.ai/api/scan/devops`, { token });
        const scanData = initiateResponse.data.scanData;

        core.info(`Scan initiated - Here is the scan url: ${scanData.scanId}, Status: ${scanData.status}`);

        // Base comment/log body
        let messageBody = `## Scan Initiated\n**Scan Report URL**: [${scanData.reportUrl}](scanData.reportUrl)\n**Status**: ${scanData.status}\n`;
        core.info(messageBody)
        
    } catch (error) {
        core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

run();