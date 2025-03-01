import { userModel, dealerModel } from "../models/userModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

//register user controller
export const registerUser = async (req, res) => {
    //get user data
    const { email, password, fullName } = req.body
    //if fileds are empty
    if (!email || !password || !fullName) {
        return res.status(400).json({success: false, message: 'All fields are required' })
    }
     
    try {
        const checkExistingUser = await userModel.findOne({ email })
        //if email already exits 
        if (checkExistingUser) {
            return res.status(400).json({success: false, message: 'User already exists' })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create user
        const newUser = new userModel({ email, password: hashedPassword, fullName })

        //save user
        await newUser.save()

        //create token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' })

        //send token to client as cokkies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:10* 24 * 60 * 60 * 1000
        })

       return res.status(201).json({success: true, message: 'User created successfully' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Something went wrong' })
    }
}

//register dealer controller
export const dealerRegister = async (req, res) => {
    //get user data
    const { email, password, fullName, address, phoneNumber } = req.body
    //if fileds are empty
    if (!email || !password || !fullName || !address || !phoneNumber) {
        return res.status(400).json({success: false, message: 'All fields are required' })
    }
     
    try {
        const checkExistingUser = await dealerModel.findOne({ email })
        //if email already exits 
        if (checkExistingUser) {
            return res.status(400).json({success: false, message: 'User already exists' })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //generate ott
        const otp = Math.floor(100000 + Math.random() * 900000);

        //create user
        const newDealer = new dealerModel({
          email,
          password: hashedPassword,
          fullName,
          address,
          phoneNumber,
          verfiyOtt: otp,
          verfiyOttExpiry: new Date(Date.now() + 60 * 60 * 1000),
        });

        //save user
        await newDealer.save()


       return res.status(201).json({success: true, message: 'Dealer created successfully' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })        
    }
}

//check ott controller
export const checkOtt = async (req, res) => {
  const { ott } = req.body;

  // Check if OTP is provided
  if (!ott) {
    return res.status(400).json({ success: false, message: "OTP is required" });
  }

  try {
    // Find dealer by OTP
    const checkExistingUser = await dealerModel.findOne({ verfiyOtt: ott });

    // Check if dealer is found
    if (!checkExistingUser) {
      return res .status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > new Date(checkExistingUser.verfiyOttExpiry)) {
      return res .status(400).json({ success: false, message: "OTP has expired" });
    }
      
    // Check if OTP matches
    if (checkExistingUser.verfiyOtt !== ott) {
      return res.status(400).json({ success: false, message: "OTP does not match" });
    }


    // Generate a token
    const token = jwt.sign(
      { id: checkExistingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    // Send token to client as cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });
      
    // Update dealer document
    checkExistingUser.isVerified = true;
    checkExistingUser.verfiyOtt = undefined;
    checkExistingUser.verfiyOttExpiry = undefined;
    await checkExistingUser.save();

    return res.status(200).json({ success: true, message: "OTP matched, registration successful" });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//logout controller
export const logout = async (req, res) => {
    res.clearCookie('token')
    return res.status(200).json({success: true, message: 'Logout successful' })
}

//Login controller for user
export const loginUser = async (req, res) => {
    const { email, password } = req.body
    //check if empty or not
    if (!email || !password) {
        return res.status(400).json({success: false, message: 'All fields are required' })
    }
    try {
        const checkExistingUser = await userModel.findOne({ email })
        //if email doesnt exits
        if (!checkExistingUser) {
            return res.status(400).json({success: false, message: 'Invalid credentials' })
        }

        //compare password
        const isMatch = await bcrypt.compare(password, checkExistingUser.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        //create token
        const token = jwt.sign({ id: checkExistingUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' })

        //send token to client as cokkies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ success: true, message: 'Login successful' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}


//login controller for dealer
export const loginDealer = async (req, res) => {
    const { email, password } = req.body
    //check if empty or not
    if (!email || !password) {
        return res.status(400).json({success: false, message: 'All fields are required' })
    }
    try {
        const checkExistingUser = await dealerModel.findOne({ email })
        //if email doesnt exits
        if (!checkExistingUser) {
            return res.status(400).json({success: false, message: 'Invalid credentials' })
        }

        //check if user is verified
        if (!checkExistingUser.isVerified) {
            return res.status(400).json({success: false, message: 'User is not verified' })
        }

        //compare password
        const isMatch = await bcrypt.compare(password, checkExistingUser.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        //create token
        const token = jwt.sign({ id: checkExistingUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' })

        //send token to client as cokkies    
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        })   

        return res.status(200).json({ success: true, message: 'Login successful' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}