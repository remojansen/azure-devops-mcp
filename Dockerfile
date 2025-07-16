# Use the official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Copy the source code
COPY . .

# Install dependencies
RUN npm install

# Install Azure CLI
RUN apt-get update && apt-get install -y curl bash python3-pip
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash
RUN az --version

# Build the TypeScript application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Expose the port (though MCP typically uses stdio, this is for potential future HTTP transport)
EXPOSE 3000

# Set the entrypoint to run the MCP server
# The organization name should be passed as a command line argument
ENTRYPOINT ["node", "dist/index.js"]

# Default command - users need to override this with their organization name
CMD ["remojansen-demo"]
