import "dotenv/config";

import bcrypt from "bcryptjs";
import readline from "node:readline";


function askHiddenPin(
  prompt: string
): Promise<string> {
  return new Promise(
    resolve => {
      const input =
        process.stdin;

      const output =
        process.stdout;


      output.write(
        prompt
      );


      input.setRawMode?.(
        true
      );

      input.resume();

      input.setEncoding(
        "utf8"
      );


      let value =
        "";


      function finish() {
        input.setRawMode?.(
          false
        );

        input.pause();

        input.removeListener(
          "data",
          handleInput
        );

        output.write(
          "\n"
        );

        resolve(
          value
        );
      }


      function handleInput(
        character: string
      ) {
        if (
          character ===
            "\u0003"
        ) {
          process.exit(
            1
          );
        }


        if (
          character ===
            "\r" ||
          character ===
            "\n"
        ) {
          finish();

          return;
        }


        if (
          character ===
            "\u007f"
        ) {
          value =
            value.slice(
              0,
              -1
            );

          return;
        }


        value +=
          character;
      }


      input.on(
        "data",
        handleInput
      );
    }
  );
}


async function main() {
  const pin =
    (
      await askHiddenPin(
        "Enter commissioner PIN: "
      )
    ).trim();


  if (
    !/^\d{4,12}$/.test(
      pin
    )
  ) {
    throw new Error(
      "PIN must contain between 4 and 12 digits"
    );
  }


  const confirmation =
    (
      await askHiddenPin(
        "Confirm commissioner PIN: "
      )
    ).trim();


  if (
    pin !==
    confirmation
  ) {
    throw new Error(
      "PIN confirmation does not match"
    );
  }


  const hash =
    await bcrypt.hash(
      pin,
      12
    );


  console.log(
    "\nAdd this value to server/.env:\n"
  );

  console.log(
    `ADMIN_PIN_HASH=${hash}`
  );
}


main()
  .catch(
    error => {
      console.error(
        error instanceof Error
          ? error.message
          : error
      );

      process.exit(
        1
      );
    }
  );