import crypto from "crypto";

export async function createCallRoom(req, res) {
  try {
    const { participants } = req.body;

    if (!Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ message: "Invalid participants" });
    }

    const sortedUsers = participants.slice().sort().join("-");
    const nonce = crypto.randomBytes(8).toString("hex");
    const roomId = `${sortedUsers}-${nonce}`;

    return res.status(200).json({ roomId });
  } catch (error) {
    console.error("createCallRoom error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}