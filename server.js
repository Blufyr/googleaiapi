// This file sets up a GraphQL API route using Next.js App Router.
// It will handle all requests to '/api/graphql'.

// Import the Next.js-specific handler. This is the fix for the 404 error.
import { createHandler } from 'graphql-http';
import { buildSchema } from 'graphql';
import fetch from 'node-fetch';

// Define the GraphQL schema.
const schema = buildSchema(`
  type Query {
    generateContent(prompt: String!): String
  }
`);

// The resolver function for the 'generateContent' query.
const rootValue = {
  generateContent: async ({ prompt }) => {
    // Retrieve the API key from environment variables.
    // In Next.js, these are typically stored in a .env.local file
    // and configured on your hosting platform.
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      console.error('API key is not configured as an environment variable!');
      return 'Error: API key is not configured.';
    }

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the text from the response.
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";

      return generatedText;
    } catch (error) {
      console.error('Error calling the Gemini API:', error);
      return `Error: ${error.message}`;
    }
  },
};

// Create the GraphQL handler.
const handler = createHandler({
  schema: schema,
  rootValue: rootValue,
});

// The Next.js API route handler will respond to both GET and POST requests.
// We are only handling POST for GraphQL queries.
export { handler as GET, handler as POST };