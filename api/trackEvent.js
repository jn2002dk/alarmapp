// Vercel Serverless Function
// Receives tracking data and logs it.

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const data = request.body; // Vercel automatically parses JSON body for Node.js functions
      console.log('Tracking Data Received:', data);

      // Here you would typically save the data to a database
      // For example, using Vercel KV, Vercel Postgres, or an external DB.
      // For now, we're just logging it to the Vercel function logs.

      response.status(200).json({ message: 'Data received successfully', receivedData: data });
    } catch (error) {
      console.error('Error processing request:', error);
      response.status(500).json({ message: 'Error processing request', error: error.message });
    }
  } else {
    // Handle any other HTTP methods or return an error
    response.setHeader('Allow', ['POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
