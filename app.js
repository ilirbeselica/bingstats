const puppeteer = require("puppeteer");
const fs = require("fs");

const tempKeywords = fs.readFileSync("./keywords.txt").toString().split("\n");
const listOfKeywords = tempKeywords.map((domain) => domain.replace("\r", ""));

const start = async (keywords) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.bing.com/search?q=test");
  await page.waitForSelector(".sb_count");
  const text = await page.evaluate(() => {
    const element = document.getElementById("sb_form_q");
    element.value = "";
  });
  for (keyword of keywords) {
    await page.waitForSelector("#sb_form_q");
    const text = await page.evaluate(() => {
      const element = document.getElementById("sb_form_q");
      element.value = "";
    });
    await page.focus("#sb_form_q");
    await page.keyboard.type(`${keyword}`, { delay: 10 });
    await page.keyboard.press("Enter");
    await page.waitForSelector("h2");
    const title = await page.evaluate((keyword) => {
      const titles = Array.from(document.querySelectorAll("h2"));
      const tempTitles = titles.map((item) => item.innerText);
      const tempKeywords = keyword.split(" ");
      let compInc = 0;
      for (word of tempTitles) {
        let tempInc = 0;
        for (let i = 0; i < tempKeywords.length; i++) {
          if (word.indexOf(tempKeywords[i] !== -1)) {
            tempInc++;
          }
        }
        if (tempInc > 0) {
          compInc++;
        }
      }
      return compInc;
    }, keyword);

    await page.waitForSelector(".sb_count");
    const test = await page.evaluate(() => {
      const element = document.querySelector(".sb_count");
      return element.innerText;
    });
    console.log(
      keyword +
        "," +
        test.replace(/,/g, "").replace("Results", "") +
        "," +
        title
    );
  }
};

start(listOfKeywords);
