const Reviews = require("../models/Reviews");
const Users = require("../models/Users");

const getAllReviews = async (req, res) => {
  const reviews = await Reviews.find();
  res.json(reviews);
};

const setReview = async (req, res) => {
  const { review, rating, user } = req.body;
  const doctor = req.params.doctorId;

  const doctorFind = await Users.findById(doctor);
  if (!doctorFind) {
    res.status(404).send("Doctor not found");
  }

  const doctorName = doctorFind.name;
  const userFind = await Users.findById(user);
  if (!userFind) {
    res.status(404).send("User not found");
  }

  const userName = userFind.name;
  //   const user = req.user.id;
  const newReview = new Reviews({
    review: review,
    rating: rating,
    user: user,
    doctor: doctor,
    doctorName: doctorName,
    userName: userName,
  });

  await newReview
    .save()
    .then((review) => {
      res.json(review);
    })
    .catch((error) => {
      res.json(error);
    });
};

const updateReview = async (req, res) => {
  const { review, rating } = req.body;
  await Reviews.findByIdAndUpdate(
    req.params.id,
    { review: review, rating: rating },
    { new: true }
  )
    .then((review) => {
      res.json(review);
    })
    .catch((error) => {
      res.json(error);
    });
};

const deleteReview = async (req, res) => {
  await Reviews.findByIdAndDelete(req.params.id)
    .then(async () => {
      const reviews = await Reviews.find();
      res.json(reviews);
    })
    .catch((error) => {
      res.json(error);
    });
};

module.exports = { getAllReviews, setReview, updateReview, deleteReview };
