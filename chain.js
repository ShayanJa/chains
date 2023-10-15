const axios = require("axios");
const fs = require("fs");

const listChains = async () => {
  try {
    const response = await axios.get(`https://chainid.network/chains.json`);
    if (response.data) {
      return response.data.map((chain) => chain.name);
    }
  } catch {
    chains = require("./chains.json");
    return chains.map((chain) => chain.name);
  }
};

const addChain = async (chainName) => {
  let chainData;
  try {
    const response = await axios.get(`https://chainid.network/chains.json`);
    chainData = response.data;
  } catch {
    chainData = require("./chains.json");
    console.error(`Error fetching chain information: Using Local...`);
  }
  if (chainData) {
    console.log("Found data");
    const chainInfo = chainData.find(
      (chain) =>
        chain.name.toLowerCase() === chainName.toLowerCase() ||
        chain.chain.toLowerCase() === chainName.toLowerCase() ||
        chain.shortName.toLowerCase() === chainName.toLowerCase()
    );
    console.log(chainInfo);
    if (chainInfo) {
      const configPath = "./hardhat.config.js" || "";
      if (fs.existsSync(configPath)) {
        fs.readFile(configPath, "utf8", (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          // Parse the existing module.exports statement
          let existingObject;
          let updatedObject;
          try {
            // Assuming module.exports is on the last line of the file
            console.log(data);
            //FIx regex to get proper export statement
            const exportsStatement = data.match(
              /module\.exports\s*=\s*({[\s\S]*?});/
            );
            console.log("export Statement", exportsStatement);
            existingObject = eval("(" + exportsStatement[1] + ")");
            console.log("exisiting Module", existingObject);
          } catch (parseError) {
            console.log(data);
            console.error(
              "Error parsing module.exports statement:",
              parseError
            );
            return;
          }
          if (existingObject?.networks) {
            existingObject.networks[chainName] = {
              chainId: chainInfo.chainId,
              url: chainInfo.rpc[0],
            };

            updatedObject = existingObject;
          } else {
            // Merge the new object with the existing object
            console.log("here2");
            updatedObject = {
              ...existingObject,
              ...{
                networks: {
                  [chainName]: {
                    chainId: chainInfo.chainId,
                    url: chainInfo.rpc[0],
                  },
                },
              },
            };
          }
          // Replace the existing module.exports statement with the updated object
          const updatedContent = data.replace(
            /module\.exports\s*=\s*({[\s\S]*?});/,
            "module.exports = " + JSON.stringify(updatedObject, null, 2) + ";"
          );

          // Write the updated content back to the file
          fs.writeFile(configPath, updatedContent, "utf8", (err) => {
            if (err) {
              console.error("Error writing file:", err);
            } else {
              console.log("File updated successfully!");
            }
          });
        });
      } else {
        console.log("hardhat.config.js not found in the current directory");
      }
    } else {
      console.log(`No chain found with the name '${chainName}'`);
    }
  }
};

const main = async () => {
  // Accept user input from command line
  const userArgs = process.argv.slice(2);
  if (userArgs[0] === "add" && userArgs[1]) {
    addChain(userArgs[1]);
  } else if (userArgs[0] == "list") {
    chains = await listChains();
    console.log(chains);
  } else if (userArgs[0] == "help") {
    console.log("Available Commands:");
    console.log("list");
    console.log("add");
  } else {
    console.log("Usage: chains.js add <chain_name>");
    console.log("Usage: chains.js list:");
  }
};

main();
