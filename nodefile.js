const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('files'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/files/main.html');
});


// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('MongoDB connection failed');
    console.log(error)
  });

app.get('/students', async (req, res) => {
  try {
    const students = await mongoose.connection.db.collection('students').find().toArray();
    res.json(students);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { registrationNumber, password } = req.body;
  
  console.log('STEP 1: Login request received for:', registrationNumber);
  
  try {
    console.log('STEP 2: Before MongoDB query');
    
    const student = await mongoose.connection.db.collection('students').findOne({
      registrationNumber: registrationNumber,
      password: password
    });
    
    console.log('STEP 3: After MongoDB query - Student found:', student ? 'YES' : 'NO');
    
    if (student) {
      console.log('STEP 4: Sending success response');
      res.json({ 
        success: true, 
        message: 'Login successful!', 
        name: student.name,
        regno: student.registrationNumber
      });
    } else {
      console.log('STEP 4: Sending failure response');
      res.json({ success: false, message: 'Invalid registration number or password' });
    }
  } catch (error) {
    console.log('STEP 5: Server error:', error);
    res.json({ success: false, message: 'Server error' });
  }
  
  console.log('STEP 6: Login request completed');
});


app.get('/one_seater_rooms', async (req, res) => {
  try {
    const rooms = await mongoose.connection.db.collection('one_seater_rooms').find().toArray();
    res.json(rooms);
  } catch (error) {
    res.json({ error: error.message });
  }
});
// Room details route 
app.get('/room_details_one', async (req, res) => {
  try {
    const roomNumber = parseInt(req.query.room);
    const room = await mongoose.connection.db.collection('one_seater_rooms').findOne({
      roomnum: roomNumber
    });
    
    res.json(room);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Book room route 
app.post('/book_room_one', async (req, res) => {
  const { roomNumber, slot, student } = req.body;
  
  console.log(`📝 Booking request: Room ${roomNumber}, Slot ${slot}`);
  console.log(`👤 Student: ${student.name} (${student.regno})`);
  
  try {
    // 1. Check if student already booked any room in occupied collection
    const existingBooking = await mongoose.connection.db.collection('occupied').findOne({
      regno: student.regno
    });
    
    if (existingBooking) {
      console.log(`Student ${student.regno} already has a booking`);
      return res.json({ 
        success: false, 
        message: 'This user has already booked a room previously.' 
      });
    }
    
    // 2. Update the specific slot from null to student object
    const result = await mongoose.connection.db.collection('one_seater_rooms').updateOne(
      { 
        roomnum: roomNumber,
        [slot]: null  // Only update if the slot is currently null
      },
      { 
        $set: { 
          [slot]: {
            name: student.name,
            regno: student.regno
          }
        }
      }
    );
    
    console.log(`MongoDB result:`, result);
    
    if (result.modifiedCount === 1) {
      // 3. Add to occupied collection to prevent multiple bookings
      await mongoose.connection.db.collection('occupied').insertOne({
        name: student.name,
        regno: student.regno,
        roomnum: roomNumber,

      });
      
      console.log(`Room ${roomNumber} booked successfully for ${student.name}`);
      res.json({ 
        success: true, 
        message: 'Room booked successfully!' 
      });
    } else {
      console.log(`Booking failed - Room ${roomNumber} might be full or doesn't exist`);
      res.json({ 
        success: false, 
        message: 'Room is full or booking failed. Please try another room.' 
      });
    }
  } catch (error) {
    console.log('Booking error:', error);
    res.json({ 
      success: false, 
      message: 'Server error during booking' 
    });
  }
});




app.get('/two_seater_rooms', async (req, res) => {
  try {
    const rooms = await mongoose.connection.db.collection('two_seater_rooms').find().toArray();
    res.json(rooms);
  } catch (error) {
    res.json({ error: error.message });
  }
});
// Room details route 
app.get('/room_details_two', async (req, res) => {
  try {
    const roomNumber = parseInt(req.query.room);
    const room = await mongoose.connection.db.collection('two_seater_rooms').findOne({
      roomnum: roomNumber
    });
    
    res.json(room);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Book room route - with underscore
app.post('/book_room_two', async (req, res) => {
  const { roomNumber, slot, student } = req.body;
  
  console.log(`Booking request: Room ${roomNumber}, Slot ${slot}`);
  console.log(`Student: ${student.name} (${student.regno})`);
  
  try {
    // 1. Check if student already booked any room in occupied collection
    const existingBooking = await mongoose.connection.db.collection('occupied').findOne({
      regno: student.regno
    });
    
    if (existingBooking) {
      console.log(`Student ${student.regno} already has a booking`);
      return res.json({ 
        success: false, 
        message: 'This user has already booked a room previously.' 
      });
    }
    
    // 2. Update the specific slot from null to student object
    const result = await mongoose.connection.db.collection('two_seater_rooms').updateOne(
      { 
        roomnum: roomNumber,
        [slot]: null  // Only update if the slot is currently null
      },
      { 
        $set: { 
          [slot]: {
            name: student.name,
            regno: student.regno
          }
        }
      }
    );
    
    console.log(`MongoDB result:`, result);
    
    if (result.modifiedCount === 1) {
      // 3. Add to occupied collection to prevent multiple bookings
      await mongoose.connection.db.collection('occupied').insertOne({
        name: student.name,
        regno: student.regno,
        roomnum: roomNumber,

      });
      
      console.log(`Room ${roomNumber} booked successfully for ${student.name}`);
      res.json({ 
        success: true, 
        message: 'Room booked successfully!' 
      });
    } else {
      console.log(`Booking failed - Room ${roomNumber} might be full or doesn't exist`);
      res.json({ 
        success: false, 
        message: 'Room is full or booking failed. Please try another room.' 
      });
    }
  } catch (error) {
    console.log('Booking error:', error);
    res.json({ 
      success: false, 
      message: 'Server error during booking' 
    });
  }
});




app.get('/three_seater_rooms', async (req, res) => {
  try {
    const rooms = await mongoose.connection.db.collection('three_seater_rooms').find().toArray();
    res.json(rooms);
  } catch (error) {
    res.json({ error: error.message });
  }
});


app.get('/room_details_three', async (req, res) => {
  try {
    const roomNumber = parseInt(req.query.room);
    const room = await mongoose.connection.db.collection('three_seater_rooms').findOne({
      roomnum: roomNumber
    });
    
    res.json(room);
  } catch (error) {
    res.json({ error: error.message });
  }
});


app.post('/book_room_three', async (req, res) => {
  const { roomNumber, slot, student } = req.body;
  
  console.log(`Booking request: Room ${roomNumber}, Slot ${slot}`);
  console.log(`Student: ${student.name} (${student.regno})`);
  
  try {
    // 1. Check if student already booked any room in occupied collection
    const existingBooking = await mongoose.connection.db.collection('occupied').findOne({
      regno: student.regno
    });
    
    if (existingBooking) {
      console.log(`Student ${student.regno} already has a booking`);
      return res.json({ 
        success: false, 
        message: 'This user has already booked a room previously.' 
      });
    }
    
    // 2. Update the specific slot from null to student object
    const result = await mongoose.connection.db.collection('three_seater_rooms').updateOne(
      { 
        roomnum: roomNumber,
        [slot]: null  // Only update if the slot is currently null
      },
      { 
        $set: { 
          [slot]: {
            name: student.name,
            regno: student.regno
          }
        }
      }
    );
    
    console.log(`📊 MongoDB result:`, result);
    
    if (result.modifiedCount === 1) {
      // 3. Add to occupied collection to prevent multiple bookings
      await mongoose.connection.db.collection('occupied').insertOne({
        name: student.name,
        regno: student.regno,
        roomnum: roomNumber,

      });
      
      console.log(`Room ${roomNumber} booked successfully for ${student.name}`);
      res.json({ 
        success: true, 
        message: 'Room booked successfully!' 
      });
    } else {
      console.log(`Booking failed - Room ${roomNumber} might be full or doesn't exist`);
      res.json({ 
        success: false, 
        message: 'Room is full or booking failed. Please try another room.' 
      });
    }
  } catch (error) {
    console.log('Booking error:', error);
    res.json({ 
      success: false, 
      message: 'Server error during booking' 
    });
  }
});








app.get('/four_seater_rooms', async (req, res) => {
  try {
    const rooms = await mongoose.connection.db.collection('four_seater_rooms').find().toArray();
    res.json(rooms);
  } catch (error) {
    res.json({ error: error.message });
  }
});


app.get('/room_details_four', async (req, res) => {
  try {
    const roomNumber = parseInt(req.query.room);
    const room = await mongoose.connection.db.collection('four_seater_rooms').findOne({
      roomnum: roomNumber
    });
    
    res.json(room);
  } catch (error) {
    res.json({ error: error.message });
  }
});


app.post('/book_room_four', async (req, res) => {
  const { roomNumber, slot, student } = req.body;
  
  console.log(`Booking request: Room ${roomNumber}, Slot ${slot}`);
  console.log(`Student: ${student.name} (${student.regno})`);
  
  try {
    // 1. Check if student already booked any room in occupied collection
    const existingBooking = await mongoose.connection.db.collection('occupied').findOne({
      regno: student.regno
    });
    
    if (existingBooking) {
      console.log(`Student ${student.regno} already has a booking`);
      return res.json({ 
        success: false, 
        message: 'This user has already booked a room previously.' 
      });
    }
    
    // 2. Update the specific slot from null to student object
    const result = await mongoose.connection.db.collection('four_seater_rooms').updateOne(
      { 
        roomnum: roomNumber,
        [slot]: null  // Only update if the slot is currently null
      },
      { 
        $set: { 
          [slot]: {
            name: student.name,
            regno: student.regno
          }
        }
      }
    );
    
    console.log(`MongoDB result:`, result);
    
    if (result.modifiedCount === 1) {
      // 3. Add to occupied collection to prevent multiple bookings
      await mongoose.connection.db.collection('occupied').insertOne({
        name: student.name,
        regno: student.regno,
        roomnum: roomNumber,

      });
      
      console.log(`Room ${roomNumber} booked successfully for ${student.name}`);
      res.json({ 
        success: true, 
        message: 'Room booked successfully!' 
      });
    } else {
      console.log(`Booking failed - Room ${roomNumber} might be full or doesn't exist`);
      res.json({ 
        success: false, 
        message: 'Room is full or booking failed. Please try another room.' 
      });
    }
  } catch (error) {
    console.log('Booking error:', error);
    res.json({ 
      success: false, 
      message: 'Server error during booking' 
    });
  }
});





// Leave room route
app.post('/leave_room', async (req, res) => {
  const { regno, name } = req.body;
  
  console.log(`Leave room request from: ${name} (${regno})`);
  
  try {
    // STEP 1: FIRST remove from occupied collection
    const occupiedBooking = await mongoose.connection.db.collection('occupied').findOneAndDelete({
      regno: regno
    });
    
    if (!occupiedBooking) {
      console.log(`No booking found in occupied collection for: ${regno}`);
      return res.json({ 
        success: false, 
        message: 'No room booking found for this user.' 
      });
    }
    
    const roomNumberFromOccupied = occupiedBooking.roomnum;
    console.log(`Removed from occupied collection - Room: ${roomNumberFromOccupied}`);
    
    // STEP 2: THEN remove from ALL room collections by regno
    const collections = [
      'one_seater_rooms',
      'two_seater_rooms', 
      'three_seater_rooms',
      'four_seater_rooms'
    ];
    
    let removedFromRoom = false;
    
    for (const collName of collections) {
      // Find the room where this student is registered
      const room = await mongoose.connection.db.collection(collName).findOne({
        $or: [
          { 'st1.regno': regno },
          { 'st2.regno': regno },
          { 'st3.regno': regno },
          { 'st4.regno': regno }
        ]
      });
      
      if (room) {
        console.log(`Found student in ${collName}, Room: ${room.roomnum}`);
        
        // Clear the student from all possible slots - SAFE CHECK
        const updateFields = {};
        
        // Only check fields that exist and have the student
        if (room.st1 && room.st1.regno === regno) updateFields.st1 = null;
        if (room.st2 && room.st2.regno === regno) updateFields.st2 = null;
        if (room.st3 && room.st3.regno === regno) updateFields.st3 = null;
        if (room.st4 && room.st4.regno === regno) updateFields.st4 = null;
        
        if (Object.keys(updateFields).length > 0) {
          await mongoose.connection.db.collection(collName).updateOne(
            { roomnum: room.roomnum },
            { $set: updateFields }
          );
          console.log(`Removed from ${collName}, Room ${room.roomnum}`);
          removedFromRoom = true;
          // Found and removed from one room, no need to check other collections
          break;
        }
      }
    }
    
    if (removedFromRoom) {
      console.log(`Successfully removed ${name} from ALL collections`);
      res.json({ 
        success: true, 
        message: 'Successfully left the room!' 
      });
    } else {
      console.log(`Removed from occupied but not found in any room collection`);
      res.json({ 
        success: true, 
        message: 'Successfully left the room! (Cleaned up booking record)' 
      });
    }
    
  } catch (error) {
    console.log('Error leaving room:', error);
    res.json({ 
      success: false, 
      message: 'Server error while leaving room' 
    });
  }
});
// Check if user already has a booking - simplified version
app.get('/check_booking', async (req, res) => {
  const regno = req.query.regno;
  
  console.log(`Checking booking for: ${regno}`);
  
  try {
    // Just check the occupied collection (fastest check)
    const booking = await mongoose.connection.db.collection('occupied').findOne({
      regno: regno
    });
    
    if (booking) {
      console.log(`Booking found for: ${regno}`);
      res.json({ hasBooking: true });
    } else {
      console.log(`No booking found for: ${regno}`);
      res.json({ hasBooking: false });
    }
    
  } catch (error) {
    console.log('Error checking booking:', error);
    res.json({ hasBooking: false });
  }
});




app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});