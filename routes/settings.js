const express = require('express')
const router = express.Router()
const CrvRate = require('../models/crvRate')

// Show current CRV rate settings
router.get('/crv-rate', async (req, res) => {
    try {
        let settings = await CrvRate.findOne({ key: 'current' });
        if (!settings) {
            settings = await CrvRate.create({ key: 'current', lowRate: 0.05, highRate: 0.10 });
        }
        res.render('settings/crv-rate', { settings, message: null });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Update the CRV rate settings
router.post('/crv-rate', async (req, res) => {
    try {
        const lowRate = parseFloat(req.body.lowRate);
        const highRate = parseFloat(req.body.highRate);

        if (isNaN(lowRate) || isNaN(highRate)) {
            const settings = await CrvRate.findOne({ key: 'current' });
            return res.render('settings/crv-rate', {
                settings,
                message: 'Please enter valid numbers for both rates.'
            });
        }

        const settings = await CrvRate.findOneAndUpdate(
            { key: 'current' },
            { lowRate, highRate },
            { new: true, upsert: true }
        );

        res.render('settings/crv-rate', { settings, message: 'CRV rates updated successfully.' });
    } catch (error) {
        console.error(error);
        res.redirect('/settings/crv-rate');
    }
});

module.exports = router