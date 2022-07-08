import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import io from "socket.io-client";
import { Outlet, useNavigate } from "react-router-dom";

/** Import Components & CSS **/
import "./ListOfPeople.component.css";

/**
 * Event List
 *
 * List of existing events
 */
function EventList({ user, setTarget }) {
  /** Declare constants */
  const server = process.env.REACT_APP_SERVER;
  const navigate = useNavigate();
  const [group, setGroup] = useState([]);

  /** Handle selections */
  const onSelectEvent = (targetEvent) => async () => {
    const convoID = await getConvoAsync(targetEvent._id);
    targetEvent.convoID = convoID;
    setTarget(targetEvent);
    const targetHandle = targetEvent?.name?.replace(/( )/gi, "-");
    navigate(targetHandle);
  };

  /** Get Convo of the event **/
  const getConvoAsync = async (targetID) => {
    const response = await axios
      .get(server + "/message/event/" + targetID)
      .then((res) => {
        return res.data.convoID;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
    return response;
  };

  /** Get the list of events from server */
  const getGroupAsync = async () => {
    const response = await axios
      .get(server + "/events")
      .then((res) => {
        return res.data.events;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
    const myEvent = [],
      otherEvent = [];
    response.forEach((event) => {
      (event.ownerID == user._id ? myEvent : otherEvent).push(event);
    });
    setGroup(myEvent.concat(otherEvent));
  };
  /** Run once for performance */
  useEffect(() => {
    const newSocket = io(server);
    newSocket.on("connect", () => {
      console.log("listening for updateEvent", newSocket.id);
    });
    newSocket.on("connection_error", (error) =>
      console.log("Failed to connect: ", error)
    );
    newSocket.on("updateEvent", () => {
      getGroupAsync();
    });

    getGroupAsync();

    return () => newSocket.close();
  }, []);

  return (
    <>
      <div className="UI" id="list_of_people">
        <div className="list-component">
          <div className="filter-component">
            {" "}
            <select className="filter-options">
              <option value="filter-houses">All Events</option>
              <option value="filter-houses">MyEvents</option>
              <option value="filter-floor">Registered</option>
              <option value="filter-CCA">New</option>
            </select>
          </div>
          <div className="list-of-people-component">
            <div className="list-of-people">
              <ul>
                {group.map((event) => {
                  return (
                    <li key={event._id}>
                      <a onClick={onSelectEvent(event)}>
                        <img src={event.img} />
                        {event.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}

EventList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
  setTarget: PropTypes.func.isRequired,
};

export default EventList;
