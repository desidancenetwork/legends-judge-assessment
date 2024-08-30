# ddn-legends-judge-assessment
Desi Dance Network - Legends Judge Assessment
# DDN Legends Dance Championship Judging Platform

## Overview

The DDN Legends Dance Championship Judging Platform is a web-based application designed to evaluate potential judging candidates for the Legends dance competition. It provides a streamlined interface for judges to assess dance performances, input scores, and generate comprehensive reports. The platform is built with Next.js, React, and TypeScript, offering a robust and scalable solution for dance competition organizers.

## Features

- User authentication for current judges and administrators.
- Video playback for dance performance assessment.
- Real-time note-taking during video playback.
- Timed assessment sessions.
- Drag and drop performance ranking system.
- PDF report generation with Google Drive integration.
- Admin dashboard for managing videos and application settings.
- Responsive design for various devices.

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/desidancenetwork/ddn-legends-judge-assessment.git
   cd ddn-legends-judge-assessment
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
   GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is designed to be deployed on Coolify, which provides an optimal environment for Next.ts applications.


## Future Plans and Ownership Transfer

This project is intended to be transferred to Desi Dance Network (DDN) for long-term maintenance and use.

## Contributing

While this project was created by the original developer and will be primarily maintained by DDN, contributions from the community are welcome. Please refer to the CONTRIBUTORS.md file for guidelines on how to contribute.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Desi Dance Network for the opportunity to develop this platform
- All contributors and testers who have helped shape this project

For any questions or support, please contact [Your Contact Information or DDN's Contact Information].