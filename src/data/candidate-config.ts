// Owner-controlled content for /candidates/. Nothing here is shown until the owner has confirmed it.

// Set to true ONLY after the owner confirms that candidates are never charged any fee.
// While false, the "never asks for money" notice is hidden.
export const candidatesNeverCharged=false;

// The owner must supply the real answer to "Do I have to pay any fees?".
// While it still holds the placeholder (or is empty), the question stays off the page and out of the FAQPage schema.
// Add the Arabic text to src/data/client-arabic.json too.
export const candidateFeesAnswer='[OWNER TO CONFIRM]';
export const candidateFeesConfirmed=candidateFeesAnswer.trim()!==''&&!/OWNER TO CONFIRM/i.test(candidateFeesAnswer);
