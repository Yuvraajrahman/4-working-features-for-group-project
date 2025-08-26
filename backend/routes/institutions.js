const express = require('express');
const router = express.Router();

// ...existing code...

// PUT /api/institutions/:idOrName/settings
router.put('/:idOrName/settings', async (req, res) => {
  const { idOrName } = req.params;
  const { name, email, phone, address, description } = req.body;
  try {
    // Find institution by id or name
    const institution = await Institution.findOne(
      isNaN(Number(idOrName))
        ? { name: idOrName }
        : { _id: idOrName }
    );
    if (!institution) return res.status(404).send("Institution not found");

    if (name !== undefined) institution.name = name;
    if (email !== undefined) institution.email = email;
    if (phone !== undefined) institution.phone = phone;
    if (address !== undefined) institution.address = address;
    if (description !== undefined) institution.description = description;

    await institution.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).send("Failed to update institution");
  }
});

// ...existing code...
module.exports = router;