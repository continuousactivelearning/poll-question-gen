# Use Node 18
FROM node:18

# Enable Corepack & set working directory
RUN corepack enable
WORKDIR /app

# Copy frontend files
COPY . .

# Install dependencies
RUN pnpm install

# Build Vite project
RUN pnpm build

# Use a static server (can also be nginx, but vite preview works too)
CMD ["pnpm", "preview", "--host", "--port", "5173"]
