# Medium Article Scraper

This project uses Playwright and Browser-Use to automate searching Medium for artificial intelligence articles, collecting author information, and finding their LinkedIn profiles.

## Features

- Automatically searches Medium for AI articles
- Collects article titles, URLs, and author names
- Finds LinkedIn profiles for authors
- Handles popups and consent dialogs
- Implements error handling and retry logic
- Outputs structured data in JSON format

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   \`\`\`bash
   npm install playwright browser-use
   \`\`\`
3. Install Playwright browsers:
   \`\`\`bash
   npx playwright install chromium
   \`\`\`

## Running the Script

To run the script, use the following command:

\`\`\`bash
node index.js
\`\`\`

The script will:
1. Open Medium and search for "artificial intelligence" articles
2. Collect at least 20 articles with their titles, URLs, and author names
3. Find LinkedIn profiles for up to 10 unique authors
4. Save the data to `authors.json`

## Output

The script generates a JSON file (`authors.json`) with the following structure:

\`\`\`json
[
  {
    "author": "Author Name",
    "article_title": "Article Title",
    "medium_url": "https://medium.com/...",
    "linkedin_url": "https://linkedin.com/in/..."
  },
  ...
]
\`\`\`

## Requirements

- Node.js (v14 or higher)
- NPM or Yarn
- Playwright
- Browser-Use

## Troubleshooting

If you encounter issues:

1. **Login Prompts**: Medium might show a login wall after a few searches. The script attempts to handle this, but you may need to manually dismiss it.

2. **Rate Limiting**: If you run the script multiple times, Google or Medium might temporarily rate-limit your IP. Wait a few minutes before trying again.

3. **Browser Visibility**: The script runs with a visible browser to allow monitoring. If you want to run headless, change `headless: false` to `headless: true` in the script.

4. **LinkedIn Detection**: The script uses Google search to find LinkedIn profiles. If it's not finding profiles, you may need to adjust the search query in the code.

## Notes

- The script includes a slowMo parameter to make automation more visible and reliable
- It implements pagination logic to collect enough articles
- Error handling is included to make the script more robust
