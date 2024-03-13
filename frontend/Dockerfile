FROM node:20 AS build

# Build stage

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts -g @angular/cli && npm install --ignore-scripts

COPY src src
COPY server.ts angular.json tsconfig*.json ./
RUN ng build --output-path=./dist

# Serve stage

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/browser /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /etc/nginx

USER nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
