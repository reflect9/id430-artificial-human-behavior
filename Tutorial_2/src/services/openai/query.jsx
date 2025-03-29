import { ReserveRoom } from "../firebase/rooms/ReserveRoom";
import { RetrieveReservations } from "../firebase/reservations/RetrieveReservations";

export async function query({ apiKey, dialogues, input, allRooms, setResponse }) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        }, 
        body: JSON.stringify({
            model: 'gpt-4o-2024-08-06',
            messages: [
                { role: 'system', content: `
You are a helpful assistant that helps the user reserve rooms in ID KAIST. 
All Rooms in ID KAIST: 
    ${Object.values(allRooms).map(room => "- NAME:" + room.name + ", LOCATION:" + room.location).join('\n')}

Based on the previous dialogues and the user's current input, you need to detect the user's intentType and provide the necessary information to help the user. Possible types of intentType are "greeting", "reserve a room", "list all rooms", "view reservations", "cancel a reservation","get help", and "others".
    - If the detected intentType is "greeting", provide a greeting message.
    - If the detected intentType is "reserve a room", try to extract necessary parameters for the reservation, such as start/end datetime, room, purpose, and user's email.
    - If the detected intentType is "list all rooms", provide a list of all available rooms.
    - If the detected intentType is "view reservations", try to extract parameters such as the name of the room to check. 
    - If the detected intentType is "cancel a reservation", try to extract the reservation ID.
    - If the detected intentType is "get help", provide general information about the chatbot.
    - If the detected intentType is "others", provide any relevant responding message  
                    
    All date and time values should be in the format "YYYY-MM-DD" and "HH:MM" respectively, in Korean Standard Time (KST), based on the current date and time.
    
    * Current date and time is ${new Date().toLocaleString().replace(',', '')}
    * You must either provide answers in Korean or English based on the user's input. 
    * Use linebreaks where necessary.
Previous dialogues: 
    ${JSON.stringify(dialogues)}       
` },
                { role: 'user', content: input}
            ],
            store: true,
            response_format: {
                type: "json_schema", 
                json_schema: {
                    name: 'intent',
                    schema: {
                        type: 'object',
                        properties: {
                            intentType: {
                                type: 'string',
                                enum: ['greeting', 'reserve a room', 'list all rooms', 'view reservations', 'cancel a reservation', 'get help', 'others']
                            },
                            responseForGreeting : {
                                type:"object",
                                description: "Response for greeting",
                                properties: {
                                    message: {
                                        type: 'string'
                                    }
                                }
                            },
                            paramsForReservation : {
                                type:"object",
                                description: "Parameters extracted for making a new reservation",
                                properties: {
                                    startDateTime: {
                                        type: 'string', 
                                        format: 'datetime'
                                    },
                                    endDateTime: {
                                        type: 'string', 
                                        format: 'datetime'
                                    },
                                    room: {
                                        type: "string",
                                        enum: Object.values(allRooms).map(room => room.name),
                                        description: "Room ID. It should be one of the room names in the list of All rooms in ID KAIST."
                                    },
                                    purpose: {
                                        type: 'string'
                                    },
                                    user_email: {
                                        type: 'string'
                                    },
                                    isComplete: {
                                        type: 'boolean',
                                        description: "Indicates whether the all the properties are complete or not."
                                    }
                                }
                            },
                            paramsForListAllRooms : {
                                type: "string",
                                description: "Response for listing all rooms intent. It should be a string of all room names and their information with line breaks."
                            },
                            paramsForViewReservations: {
                                type: "object",
                                description: "Parameters for view reservations",
                                properties: {
                                    room: { type: "string" },
                                    startDateTime: { type: "string", format: "datetime", description: "Start date time of the reservation" },
                                    endDateTime: { type: "string", format: "datetime", description: "End date time of the reservation" }
                                }
                            },   
                            responseForGetHelp: {
                                type: "object",
                                description: "Response for getting help",
                                properties: {
                                    message: { type: "string" }
                                }
                            },
                            responseForOthers: {
                                type: "object",
                                description: "Response for other types of intent",
                                properties: {
                                    message: { type: "string" }
                                }
                            },
                        },
                        required: ['intentType']
                    }
                }

            }
        })
    });
    const data = await res.json();
    const rawJSON = data.choices?.[0]?.message?.content || null; 
    const parsedJSON = JSON.parse(rawJSON);

    // Handle the response based on the detected intentType
    if (parsedJSON.intentType === "greeting") {
        setResponse(parsedJSON.responseForGreeting.message);
    } else if (parsedJSON.intentType == "reserve a room") {
        const reservationFrom = <div>
            <span>공간을 새로 예약하고 싶어하시는군요. 아래 표에서 누락된 정보를 알려주신 다음, [확인] 버튼을 눌러주세요.</span>
            <table className="ReservationForm">
                <tbody>
                    <tr><th>방 이름 Room Name</th><td>{parsedJSON.paramsForReservation.room}</td></tr>
                    <tr><th>시작 시간 Start DateTime</th><td>{parsedJSON.paramsForReservation.startDateTime}</td></tr>
                    <tr><th>종료 시간 End DateTime</th><td>{parsedJSON.paramsForReservation.endDateTime}</td></tr>
                    <tr><th>사용 목적 Purpose of Use</th><td>{parsedJSON.paramsForReservation.purpose}</td></tr>
                    <tr><th>이메일 Email</th><td>{parsedJSON.paramsForReservation.user_email}</td></tr>
                    <tr><td colSpan={2} className="isComplete">
                        {parsedJSON.paramsForReservation.isComplete ?
                            <button onClick={async () => {
                                // Add reservation to the database
                                console.log("Adding reservation to the database...");
                                let reservationRef = await ReserveRoom(parsedJSON.paramsForReservation);
                                if (reservationRef !== null) {
                                    setResponse(`예약이 성공적으로 완료되었습니다. 예약 ID: ${reservationRef.id}`);
                                } else {
                                    setResponse(`예약 중 오류가 발생했습니다. 다시 시도해주세요.`);
                                }
                            }}>예약하기</button> :
                            <span>일부 정보가 누락되어 있습니다. Insufficient information</span>
                        }
                    </td></tr>
                </tbody>
            </table>
        </div>
        setResponse(reservationFrom);
    } else if (parsedJSON.intentType === "list all rooms") {
        setResponse(`ID KAIST에는 다음과 같은 공간을 예약할 수 있습니다. \n${parsedJSON.paramsForListAllRooms}`);
    } else if (parsedJSON.intentType === "view reservations") {
        let roomNameToCheck = parsedJSON.paramsForViewReservations.room;
        let startDateTime = parsedJSON.paramsForViewReservations.startDateTime;
        let endDateTime = parsedJSON.paramsForViewReservations.endDateTime;
        let reservations = await RetrieveReservations(roomNameToCheck, startDateTime, endDateTime);
        if (reservations.length==0) {
            setResponse(`해당 기간에 ${roomNameToCheck}에는 예약된 내역이 없습니다.`);
        } else {
            let reservationList = Object.values(reservations).map(reservation => {
                let startDateTimeObj = new Date(reservation.startDateTime.seconds * 1000);
                let endDateTimeObj = new Date(reservation.endDateTime.seconds * 1000);
                return `시작 시간: ${convertDateToString(startDateTimeObj)}, 종료 시간: ${convertDateToString(endDateTimeObj)}, 사용 목적: ${reservation.purpose}, 예약자 이메일: ${reservation.user_email}`;
            });
            setResponse(`${parsedJSON.paramsForViewReservations.room}의 예약상황: \n${reservationList.join('\n')}`);
        }
    } else if (parsedJSON.intentType === "cancel a reservation") {
        setResponse(`Not developed yet`);
    } else if (parsedJSON.intentType === "get help") {
        setResponse(parsedJSON.responseForGetHelp.message);
    } else if (parsedJSON.intentType === "others") {
        setResponse(parsedJSON.responseForOthers.message);
    } else {
        setResponse(parsedJSON.responseForGetHelp.message);
    }
}


function convertDateToString(dateObj) {
    // 날짜를 "2025년 3월 29일 (토)" 형태로
    const dateText = dateObj.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short"
    });
    // 시간을 "오후 3:00" 형태로
    const timeText = dateObj.toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    const formatted = `${dateText} ${timeText}`;
    return formatted;
}