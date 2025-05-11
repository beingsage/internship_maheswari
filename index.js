const { chromium } = require("playwright");
const fs = require("fs");

async function main() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });

  const page = await context.newPage();

  console.log("Starting Medium article search...");

  try {
    await page.goto("https://medium.com/", { waitUntil: "networkidle" });

    await handlePopups(page);

    console.log("Searching for artificial intelligence articles...");
    await page.click('input[placeholder="Search Medium"]');
    await page.fill('input[placeholder="Search Medium"]', "artificial intelligence");
    await page.press('input[placeholder="Search Medium"]', "Enter");
    await page.waitForLoadState("networkidle");

    console.log("Collecting article data...");
    const articles = [];
    let scrollAttempts = 0;
    const maxScrollAttempts = 10;

    while (articles.length < 20 && scrollAttempts < maxScrollAttempts) {
      const newArticles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll("article");
        const results = [];
        articleElements.forEach((article) => {
          const titleElement = article.querySelector("h2");
          const linkElement = article.querySelector("a");
          const authorElement = article.querySelector('a[rel="author"], a[href*="/@"]');
          if (titleElement && linkElement && authorElement) {
            const url = linkElement.href.includes("medium.com")
              ? linkElement.href
              : `https://medium.com${linkElement.href}`;
            results.push({
              title: titleElement.textContent.trim(),
              url,
              author: authorElement.textContent.trim(),
            });
          }
        });
        return results;
      });

      for (const article of newArticles) {
        const isDuplicate = articles.some((a) => a.url === article.url);
        if (!isDuplicate && article.title && article.url && article.author) {
          articles.push(article);
        }
      }
      console.log(`Collected ${articles.length} unique articles so far...`);

      if (newArticles.length === 0) {
        scrollAttempts++;
      } else {
        scrollAttempts = 0;
      }

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      if (articles.length >= 20) break;
    }

    const uniqueAuthors = [...new Set(articles.map((article) => article.author))];
    console.log(`Found ${uniqueAuthors.length} unique authors`);

    const authorData = [];
    let linkedInCount = 0;

    for (const author of uniqueAuthors) {
      if (linkedInCount >= 10) break;

      console.log(`Finding LinkedIn profile for ${author}...`);
      const searchPage = await context.newPage();

      try {
        await searchPage.goto("https://www.google.com", { waitUntil: "networkidle" });
        await handlePopups(searchPage);

        await searchPage.fill('input[name="q"]', `${author} medium writer linkedin profile`);
        await searchPage.press('input[name="q"]', "Enter");
        await searchPage.waitForLoadState("networkidle");

        const linkedInUrl = await searchPage.evaluate(() => {
          const links = document.querySelectorAll('a[href*="linkedin.com/in/"]');
          for (const link of links) {
            const url = link.href;
            if (url.includes("linkedin.com/in/")) return url;
          }
          return null;
        });

        if (linkedInUrl && linkedInUrl.includes("linkedin.com/in/")) {
          const authorArticles = articles.filter((article) => article.author === article);
          for (const article of authorArticles) {
            authorData.push({
              author,
              article_title: article.title,
              medium_url: article.url,
              linkedin_url: linkedInUrl,
            });
          }
          linkedInCount++;
          console.log(`Found LinkedIn profile for ${author}: ${linkedInUrl}`);
        } else {
          console.log(`Could not find a valid LinkedIn profile for ${author}`);
        }
      } catch (error) {
        console.error(`Error finding LinkedIn profile for ${author}:`, error);
      } finally {
        await searchPage.close();
      }
    }

    fs.writeFileSync("authors.json", JSON.stringify(authorData, null, 2));
    console.log(`Successfully saved data for ${linkedInCount} authors to authors.json`);
  } catch (error) {
    console.error("An error occurred during execution:", error);
  } finally {
    await browser.close();
  }
}

async function handlePopups(page) {
  try {
    const acceptButton = await page.$('button:text("Accept"), button:text("I agree"), button:text("Continue"), button:text("Not now")');
    if (acceptButton) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
  } catch (error) {
    console.log("No popups detected or error handling popups:", error);
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});