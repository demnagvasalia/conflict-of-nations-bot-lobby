import puppeteer from "puppeteer";
import VPNConnector from "./VPNConnector.mjs";
import { randomText } from "./utils/randomUtil.mjs";

const gameId = process.argv[2];

async function joinGame() {
    const vpnConnector = new VPNConnector();

    return new Promise((resolve, reject) => {
        vpnConnector.once("connected", async () => {
            console.log("VPN connected, joining game...");
            try {
                await joinGameProcess();
                vpnConnector.disconnect();
                resolve();
            } catch (error) {
                vpnConnector.disconnect();
                reject(error);
            }
        });

        vpnConnector.once("error", (error) => {
            console.error("Error connecting to VPN:", error);
            reject(error);
        });

        vpnConnector.connectToRandomVPN();
    });
}

async function joinGameProcess() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    await delay(500);
    await page.goto('https://con.onelink.me/kZW6/buosjarv', {
        waitUntil: 'networkidle2'
    });

    await page.reload();

    await delay(1000);

    // Fill username
    await page.waitForSelector("#username");
    const username = "gen_" + randomText(6);
    await page.type("#username", username);

    console.log("[con] typing username");

    // Fill password
    await page.waitForSelector("#password");
    await page.type("#password", "Kacper123");

    console.log("[con] typing password");

    // Fill email
    await page.waitForSelector("#email");
    await page.type("#email", randomText(7) + "@example.com");

    console.log("[con] typing email");

    await delay(1000);

    await page.waitForSelector("#func_ok_button");
    await page.click("#func_ok_button");
    await delay(300);
    await page.click("#func_ok_button");
    await delay(1000);
    await page.click("#func_ok_button");
    await delay(500);
    await page.click("#func_ok_button");

    console.log("[con] clicking login button");

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    if (page.url().includes("index.php")) throw Error("Failed to register, IP blocked");

    await page.goto("https://www.conflictnations.com/game.php");

    await page.waitForSelector("#ifm");
    const frameElement = await page.$("#ifm");
    const frame = await frameElement.contentFrame();

    await frame.waitForSelector(".close_button_s");
    const closeButtons = await frame.$$(".close_button_s");
    for (let element of closeButtons) {
        await element.click();
        console.log("[con] closing ads")
    }

    await frame.waitForSelector("#ui_open_new_games");
    await frame.click("#ui_open_new_games");

    await frame.waitForSelector("#searchUser");
    await frame.type("#searchUser", gameId);
    await page.keyboard.press("Enter");

    console.log("[con] searching game");

    await delay(500);
    await page.keyboard.press("Enter");
    await delay(1500);
    // Get search result and if empty throw error
    await frame.waitForSelector("#func_game_tiles");
    const games = await frame.$eval("#func_game_tiles .game-tile", (elements) => elements.length);
    if (games === 0) throw Error("Game search result empty");

    await frame.click(`button[data-game-id="${gameId}"]`);

    console.log("[con] joining game");

    const pageTarget = page.target();

    await frame.waitForSelector(".func_confirm_dialog_accept");
    await frame.click(".func_confirm_dialog_accept");

    // Get the game window reference
    const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
    const gamePage = await newTarget.page();

    // Wait for the play button to appear and click it
    await gamePage.waitForSelector("#ifm");
    gamePage.evaluate(() => {
        const interval = setInterval(() => {
            let playButton = document
                .querySelector("iframe")
                .contentWindow.document.querySelector("#func_cat_chooser_random");

            if (playButton != undefined) {
                clearInterval(interval);
                playButton.click();
            }
        }, 2000);
    });
    console.log("[con] choosing random country");
    await delay(15000);
    console.log(`[con] Done! ${username}`);
    await browser.close();
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

// Main loop
async function main() {
    while (true) {
        try {
            await joinGame();
        } catch (error) {
            console.error("Error during game join process:", error);
        }
        console.log("Restarting process...");
    }
}

main();
