const Address = require('../models/Address');

// @desc    Get all saved addresses for current user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault -createdAt');
    res.status(200).json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { name, phone, street, city, state, pincode, landmark, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    // If first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = count === 0 ? true : isDefault;

    const address = await Address.create({
      user: req.user.id,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      isDefault: shouldBeDefault
    });

    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { name, phone, street, city, state, pincode, landmark, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      { name, phone, street, city, state, pincode, landmark, isDefault },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(req.params.id);

    // If we deleted the default, set another default if exists
    if (wasDefault) {
      const another = await Address.findOne({ user: req.user.id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
};
