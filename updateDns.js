const vultrNode = require("@vultr/vultr-node");
const http = require("http");
const notifier = require("node-notifier");
const dotenv = require("dotenv");
dotenv.config();

const httpOptions = {
  host: "ipinfo.io",
  port: 80,
  path: "/json",
};

if (process.env.IPINFO_TOKEN) {
  httpOptions["path"] += `?token=${process.env.IPINFO_TOKEN}`;
}

const vultr = vultrNode.initialize({
  apiKey: process.env.VULTR_API_KEY,
  rateLimit: 600,
});

const updateDns = () => {
  http
    .get(httpOptions, function (res) {
      var str = "";
      res.on("data", function (chunk) {
        str += chunk;
      });

      res.on("end", function () {
        const data = JSON.parse(str);

        const { ip, org } = data;
        const asn = org.split(" ")[0].trim();
        const asn_allowed = process.env.ALLOWED_ASN.split(",")
          .map((a) => a.trim())
          .includes(asn);

        if (!org || !asn_allowed) {
          // console.log(
          //   `Ops, you are on a different internet provider: Current Isp: ${org}, Ip: ${ip}`
          // );
          notifier.notify({
            title: "Local Server Dns",
            message: `Ops, you are on a different internet provider. Current Isp: ${org}, Ip: ${ip}`,
          });
        } else {
          console.log(`Updating local server dns records, Current Ip: ${ip}`);
          // notifier.notify({
          //   title: "Updating local server dns records",
          //   message: `Current Ip: ${ip}`,
          // });

          updateVultrRecords(ip);
        }
      });
    })
    .on("error", function (e) {
      // console.log("Error getting ip address. Message: ", e.message);
      notifier.notify({
        title: "Local Server Dns",
        message: `Error getting ip address - (${e.message})`,
      });
    });
};

const updateVultrRecords = (ip) => {
  // Initialize the instance with your configuration

  vultr.dns
    .listRecords({ "dns-domain": process.env.VULTR_DOMAIN })
    .then((response) => {
      if (response instanceof Error) {
        // console.log(`Error getting vultr dns records - (${response.message})`);
        notifier.notify({
          title: "Local Server Dns",
          message: `Error getting vultr dns records - (${response.message})`,
        });
      } else {
        response.records.forEach((record) => {
          updateVultrRecord(ip, record);
        });

        // console.log("Dns update completed");
        notifier.notify({
          title: "Local Server Dns",
          message: "Completed",
        });
      }
    });
};

const updateVultrRecord = (ip, record) => {
  const allowed_subdomains = process.env.VULTR_SUBDOMAINS.split(",").map((el) =>
    el.trim()
  );
  if (
    record.type === "A" &&
    record.name !== "" &&
    allowed_subdomains.includes(record.name)
  ) {
    if (record.data === ip) {
      // notifier.notify({
      //   title: `${record.name}.${process.env.VULTR_DOMAIN}`,
      //   message: "Has current ip",
      // });
      console.log(record.name, "pointed to present ip");
    } else {
      vultr.dns
        .updateRecord({
          "dns-domain": process.env.VULTR_DOMAIN,
          "record-id": record.id,
          data: ip,
        })
        .then((r) => {
          console.log(record.name, "Updated with present ip address");
          // notifier.notify({
          //   title: `UpdateLocalServerDns: ${record.name}`,
          //   message: "Updated ip address.",
          // });
        });
    }
  }
};

updateDns();
