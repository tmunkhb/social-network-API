const { Thought, User } = require('../models');

const thoughtController = {
    // get all thoughts
    getAllThoughts(req, res) {
        Thought.find({})
        .populate({ path: 'reactions', select: '-__v'})
        .sort({ _id: -1})
        .select('-__v')
        .then(dbThoughtsData => res.json(dbThoughtsData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    // get thoughts by id
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
        .populate({ path: 'reactions', select: '-__v'})
        .select('-__v')
        .sort({ _id: -1 })
        .then(dbThoughtsData => {
            if (!dbThoughtsData) {
                res.status(404).json({ message: 'No thoughts found with this id!'});
                return;
            }
            res.json(dbThoughtsData);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    // create thought
    createThought({ body}, res) {
        Thought.create(body)
        .then(({ _id }) => {
            return User.findOneAndUpdate(
                { _id: body.userId },
                { $push: { thoughts: _id } },
                { new: true }
            );
        })
        .then(dbThoughtsData => {
            if (!dbThoughtsData) {
                res.status(400).json({ message: 'No user found with this id!'});
                return;
            }
            res.json(dbThoughtsData);
        })
        .catch(err => res.json(err));
    },

    // update thought
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
        .then(dbThoughtsData => {
            if (!dbThoughtsData) {
                res.status(404).json({ message: 'No thoughts found with this id!'});
                return;
            }
            res.json(dbThoughtsData);
        })
        .catch(err => res.json(err));
    },

    // delete thought
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id})
        .then(dbThoughtsData => {
            if (!dbThoughtsData) {
                res.status(404).json({ message: 'No thoughts found with this id!'});
                return;
            }
            return User.findOneAndUpdate(
                { _id: params.userId},
                { $pull: { thoughts: params.id }},
                { new: true }
            )
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!'});
                return;
            }
            res.json(dbUserData)
        })
        .catch(err => res.json(err));
    },

    // create reaction
    addReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $addToSet: { reactions: body } },
            { new: true, runValidators: true }
    )
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
                res.status(404).json({ message: "No thought with this id" });
                return;
            }
            res.json(dbThoughtData);
      })
      .catch((err) => res.json(err));
    },

    // delete reaction
    removeReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
    )
        .then((dbThoughtData) => res.json(dbThoughtData))
        .catch((err) => res.json(err));
    },
};  

module.exports = thoughtController