const axios = require("axios");
const fs = require("fs");

const listChains = async () => {
  try {
    const response = await axios.get(`https://chainid.network/chains.json`);
    if (response.data) {
      return response.data.map((chain) => chain.name);
    }
  } catch {
    return [];
  }
};

const addChain = async (chainName) => {
  try {
    const response = await axios.get(`https://chainid.network/chains.json`);
    data = response.data || require("./chains.json");
    if (data) {
      const chainInfo = data.find(
        (chain) =>
          chain.name.toLowerCase() === chainName.toLowerCase() ||
          chain.chain.toLowerCase() === chainName.toLowerCase()
        // || chain.icon.toLowerCase() === chainName.toLowerCase()
      );
      console.log(chainInfo);
      if (chainInfo) {
        console.log("chaininfo");
        const configPath = "./hardhat.config.js";
        if (fs.existsSync(configPath)) {
          console.log("here");

          fs.readFile(configPath, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            // Parse the existing module.exports statement
            let existingObject;
            try {
              // Assuming module.exports is on the last line of the file
              const exportsStatement = data.match(
                /module\.exports\s*=\s*(\{[^\}]+\});/
              )[1];
              existingObject = eval("(" + exportsStatement + ")");
              console.log(existingObject);
            } catch (parseError) {
              console.error(
                "Error parsing module.exports statement:",
                parseError
              );
              return;
            }
            // Merge the new object with the existing object
            const updatedObject = {
              ...existingObject,
              ...{
                config: {
                  networks: {
                    chainName: {
                      chainId: chainInfo.chainId,
                      url: chainInfo.rpc[0],
                    },
                  },
                },
              },
            };
            // Replace the existing module.exports statement with the updated object
            const updatedContent = data.replace(
              /module\.exports\s*=\s*\{[^\}]+\};/,
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
          // else {
          //   console.log("hardhat.config.js not found in the current directory");
          // }
        }
        // else {
        //   console.log(`No chain found with the name '${chainName}'`);
        // }
      }
    }
  } catch (error) {
    console.error(`Error fetching chain information: ${error}`);
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
  } else {
    console.log("Usage: chains.js add <chain_name>");
  }
};

main();
