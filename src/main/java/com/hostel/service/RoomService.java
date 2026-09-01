package com.hostel.service;

import com.hostel.entity.Room;

import java.util.List;

public interface RoomService {

    Room saveRoom(Room room);

    List<Room> getAllRooms();

    Room getRoomById(Long id);

    Room updateRoom(Long id, Room roomDetails);

    void deleteRoom(Long id);
}