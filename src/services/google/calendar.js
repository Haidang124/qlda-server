const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  "383707855042-m3felqh0h7bmnggjch3jon3fq1r9m74q.apps.googleusercontent.com",
  "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"
);
oAuth2Client.setCredentials({
  refresh_token:
    "1//04-Ch_wyfRt0KCgYIARAAGAQSNwF-L9IrjS-IYu1ko3KB-_77vT-qr3bLiNr7v2iwyqQhv2pn8_E5CkyxCVrchUx5RNIvtINqn_8",
});
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

exports.createEventCalendar = (
  eventStartTime,
  eventEndTime,
  summary,
  description,
  location
) => {
  //   const eventStartTime = new Date();
  //   eventStartTime.setDate(eventStartTime.getDay() + 5);
  //   const eventEndTime = new Date();
  //   eventEndTime.setDate(eventEndTime.getDay() + 7);
  //   eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);
  const event = {
    summary: summary,
    location: location
      ? location
      : `3595 California St, San Francisco, CA 94118`,
    description: description
      ? description
      : `Meet with David to talk about the new client project and how to integrate the calendar for booking.`,
    colorId: 1,
    start: {
      dateTime: eventStartTime,
      timeZone: "America/Denver",
    },
    end: {
      dateTime: eventEndTime,
      timeZone: "America/Denver",
    },
    conferenceData: {
      createRequest: {
        requestId: "sample123",
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: "America/Denver",
        items: [{ id: "primary" }],
      },
    },
    (err, res) => {
      if (err) return console.error("Free Busy Query Error: ", err);
      const eventArr = res.data.calendars.primary.busy;
      if (eventArr.length === 0)
        return calendar.events.insert(
          { calendarId: "primary", resource: event },
          (err) => {
            if (err)
              return console.error("Error Creating Calender Event:", err);
            return console.log("Calendar event successfully created.");
          }
        );
      return console.log(`Sorry I'm busy...`);
    }
  );
};
