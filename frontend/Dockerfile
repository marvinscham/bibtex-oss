FROM node:20 AS build

# Build stage

WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli && npm install

COPY . .
RUN ng build --output-path=./dist

# Serve stage

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
