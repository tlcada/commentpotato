FROM node:12.14.1 as builder

# Create directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Set environment path
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Copy files
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
COPY tsconfig.json /usr/src/app/
COPY public /usr/src/app/public
COPY src /usr/src/app/src

# Install node modules
RUN npm install --silent

# Run test and exit if non-zero code is something else than 0
RUN npm run test-ci

# Build with arg paramas
RUN REACT_APP_GA_CODE="<Add Google Analytics code here>" npm run build

# Production environment
FROM nginx:1.17.8-alpine

# Without these two lines React Router does not work
RUN rm -rf /etc/nginx/conf.d
COPY .dockerextensions /etc/nginx

COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]
