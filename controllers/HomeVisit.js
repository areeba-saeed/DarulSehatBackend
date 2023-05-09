const HomeVisitCharges = require("../models/HomeVisit");

const getHomeVisit = async (req, res) => {
  const charges = await HomeVisitCharges.find();
  res.json(charges);
};

const setCharges = async (req, res) => {
  const charges = req.body.charges;
  const newCharge = new HomeVisitCharges({
    charges: charges,
  });
  newCharge
    .save()
    .then(async () => {
      const allCharges = await HomeVisitCharges.find();
      res.json(allCharges);
    })
    .catch((error) => {
      res.json(error);
    });
};

const updateCharge = async (req, res) => {
  await HomeVisitCharges.findByIdAndUpdate(
    req.params.id,
    {
      charges: req.body.charges,
    },
    { new: true }
  )
    .then(async () => {
      const allCharges = await HomeVisitCharges.find();
      res.json(allCharges);
    })
    .catch((error) => {
      res.json(error);
    });
};

module.exports = { updateCharge, setCharges, getHomeVisit };
