import * as core from '@actions/core';
import axios from 'axios';

async function run() {
    try {
        const token = core.getInput('ZT_TOKEN', { required: true });
        const waitForAnalysisInput = core.getInput('WAIT_FOR_ANALYSIS', { required: false });
        const waitForAnalysis = waitForAnalysisInput?.toLowerCase() === 'true';
        core.info(`Initiating security scan request`);

        // Initiate the scan
        const apiUrl = `https://zt-stage-app-containerapps.agreeablestone-ae5e635a.centralus.azurecontainerapps.io/api/scan/devops`;
        const initiateResponse = await axios.post(apiUrl, { token });
        const response = initiateResponse.data;
        const code = response.code;
        if(response.status == 200)
        core.info(`Scan started successfully.\nScan Report Url: ${response.url}`);
        else
            core.setFailed(`Scan Failed.\nReason: ${response.message}`);
        let intervalId:any = undefined
        async function checkScanStatus(){
            if(intervalId)
                clearInterval(intervalId);
            try {
                const axiosResponse = await axios.get(`https://zt-stage-app-containerapps.agreeablestone-ae5e635a.centralus.azurecontainerapps.io/api/scan/devops/${code}`);
                const response = axiosResponse.data;
                if (response.scanStatus >= 4) {
                    core.info(`Scan completed successfully.`);
                }else{
                    core.info(`Scan is inprogress [${new Date().toString()}].`);
                    intervalId = setInterval(async ()=>{await checkScanStatus()},10000)
                }
                    
            } catch (error) {
                clearInterval(intervalId);
                core.setFailed(`Status polling failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if(waitForAnalysis){
            checkScanStatus();
        }
    } catch (error) {
        core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

run();
