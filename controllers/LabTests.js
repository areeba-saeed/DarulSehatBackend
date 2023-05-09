const LabTests = require("../models/LabTests");

const getAllLabTests = async (req, res) => {
  const tests = await LabTests.find();
  res.json(tests);
};

const setTest = async (req, res) => {
  const { testName, testCode, price } = req.body;
  try {
    const test = await LabTests.findOne({
      testName: { $regex: new RegExp(`^${testName}$`, "i") },
    });
    const code = await LabTests.findOne({
      testCode: { $regex: new RegExp(`^${testCode}$`, "i") },
    });
    if (test) {
      return res.status(404).send("Test with this name already exists");
    }
    if (code) {
      return res.status(404).send("Test with this code already exists");
    }

    const newLabTest = new LabTests({
      testName,
      testCode,
      price,
    });
    await newLabTest.save();
    return res.json(newLabTest);
  } catch (error) {
    return res.json(error);
  }
};

const updateTest = async (req, res) => {
  const { price, testName } = req.body;

  await LabTests.findByIdAndUpdate(
    req.params.id,
    { price: price, testName: testName },
    { new: true }
  )
    .then((test) => {
      res.json(test);
    })
    .catch((error) => {
      res.json(error);
    });
};

const deleteTest = async (req, res) => {
  await LabTests.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )
    .then(async (test) => {
      const tests = await LabTests.find();
      res.json(tests);
    })
    .catch((error) => {
      res.json(error);
    });
};

module.exports = { getAllLabTests, setTest, updateTest, deleteTest };
