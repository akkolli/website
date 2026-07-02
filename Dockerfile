FROM ghcr.io/gohugoio/hugo:v0.163.3 AS build

WORKDIR /src
COPY . .
RUN hugo --minify --cleanDestinationDir

FROM nginx:1.27-alpine

COPY --from=build /src/public /usr/share/nginx/html
EXPOSE 80
