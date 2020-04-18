# How to Contribute

Viska is an anonymous chat service in order to help people communicating with each other by not revealing their identity. When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

## Code of Conduct (COC)

Please note we have a code of conduct, please follow it in all your interactions with the project. Viska has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its COC and we expect out contributors to adhere to it.

## How to Contribute

There are many ways to contribute to this project. You might have discovered a bug and you want to report it, or probably you are thinking about a feature to implement, or even you might want to discuss an idea with us. Any kind of contribution is welcome and we would be very happy to see you here.

### Contribution Prerequisites

First make sure you have nodejs >=11.0.0 and npm >=6.0.0 installed on your system, then clone this repo and do the following to run Viska locally:

```bash
npm i # to install dependencies

npm run dev:server # to start server locally on :3002 port
npm run dev:client # to start client locally on :8080 port
```

### Bug report

We use [GitHub Issues](https://github.com/nainemom/viska/issues) to keep a track of our public bugs. You can consider this place to report any issues related to the project, but before filling a new issue, make sure you nobody has reported it before.

**Please note:** If you have found **SECURITY BUGS**, please do NOT fill a public issue and send it directly to [nainemom@gmail.com](mailto:nainemom@gmail.com).

### Feature implementation/Bug fixing

Whether you want to implement a new feature or submitting a bug-fix PR, we would be grateful if you can fill an issue, so we can coordinate with you and make sure that nobody's already working on the same feature/bug.

In order to submit a pull request, please follow the procedures below:

1. Fork the repository and create a branch out of `dev`
2. Run the following command to install project's dependencies: `npm i`
3. Run the following command to clean project's output: `npm run clean`
4. Implement the changes that you have discussed with us
5. Build the project after you are ready to submit a PR
