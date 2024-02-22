import React, { useState, useEffect,Component } from 'react';
import './App.css'; // CSS 파일 import
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // 이벤트 클릭 처리를 위해 추가
import Chart from 'react-google-charts';

// 간트 차트 데이터의 헤더
const ganttChartHeader = [
  { type: 'string', label: 'Task ID' },
  { type: 'string', label: 'Task Name' },
  { type: "string", label: "Resource" },
  { type: 'date', label: 'Start Date' },
  { type: 'date', label: 'End Date' },
  { type: 'number', label: 'Duration' },
  { type: 'number', label: 'Percent Complete' },
  { type: 'string', label: 'Dependencies' },
];

const TodosGaugeCharts = ({ tasks }) => {
  const options = {
    width: 100, height: 120,
    redFrom: 0, redTo: 25,
    yellowFrom: 25, yellowTo: 50,
    greenFrom: 50, greenTo: 100,
    minorTicks: 5,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row', // 가로 방향으로 배열
      flexWrap: 'wrap', // 내용이 넘칠 경우 다음 줄로 이동
      justifyContent: 'center', // 세로 방향 중앙 정렬
      height: '100vh', // 뷰포트 높이를 100%로 설정
    }}>
      {tasks.map((todo, index) => {
        const remainingPercentage = todo.percentage;
        return (
          <div key={index} style={{
            flex: 1, // flex 항목으로 만들어 균등 분포
            minWidth: '100px', // 최소 너비 설정
            display: 'flex',
            flexDirection: 'column', // 항목 내부는 세로 방향으로 배열
            padding: '10px', // 패딩 추가
          }}>
            <h4>{todo.task}</h4>
            <Chart
              chartType="Gauge"
              width="100%"
              height="400px"
              data={[['Label', 'Value'], ['Remaining', remainingPercentage]]}
              options={options}
            />
          </div>
        );
      })}
    </div>
  );
};

class MyGanttChart extends Component {
  render() {
    // props로부터 tasks를 받아옵니다.
    const { tasks } = this.props;

    // tasks를 간트 차트 데이터로 변환
    const ganttChartData = [
      ganttChartHeader,
      ...tasks.map((task, index) => ([
        `${task.task}-${index}`, // Task ID, 고유하게 만들기 위해 index를 추가
        task.task, // Task Name
        task.resource_content, // Resource
        new Date(task.startTime), // Start Date
        new Date(task.endTime), // End Date
        null, // Duration은 Google Gantt Chart에서 자동 계산됨
        task.percentage, // Percent Complete
        null, // Dependencies
      ])),
    ];

    return (
        <Chart
          width={'100%'}
          height={'400px'}
          chartType="Gantt"
          loader={<div>Loading Chart</div>}
          data={ganttChartData}
          rootProps={{ 'data-testid': '2' }}
        />
    );
  }
}


function App() {
  const [toDo, setToDo] = React.useState("");
  const [content, setContent] = React.useState(""); // 할 일의 상세 내용을 저장할 상태
  const [resource_content, setResoucrContent] = React.useState(""); // 할 일의 상세 내용을 저장할 상태

  const [toDos, setToDos] = React.useState([]);
  const [dueDate, setDueDate] = React.useState("");
  const [minutesToAdd, setMinutesToAdd] = React.useState('');
  const [showMinuteOptions, setShowMinuteOptions] = React.useState(false);
  // 
  const [remainingTime, setRemainingTime] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null); // 선택된 이벤트의 상세 정보를 저장할 상태
  const [isContentVisible, setIsContentVisible] = React.useState(false); // State for textarea visibility
  const toggleContentVisibility = () => setIsContentVisible(!isContentVisible); // Toggle visibility
  const [isToDoVisible, setToDoVisible] = React.useState(false); // State for textarea visibility
  const toggleToDoVisibility = () => setToDoVisible(!isToDoVisible); // Toggle visibility
  const [viewType, setViewType] = useState('calendar'); // 'calendar' 또는 'gantt'를 저장하는 상태

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  const onChangeContent = (e) => setContent(e.target.value); // 상세 내용 입력 처리
  const onChangeResourceContent = (e) => setResoucrContent(e.target.value); // 상세 내용 입력 처리

  // React.useEffect(() => {
  //   const calendarEl = document.getElementById('calendar');
  //   const calendar = new FullCalendar.Calendar(calendarEl, {
  //     initialView: 'dayGridMonth',
  //     events: toDos.map(toDo => ({
  //       title: toDo.task,
  //       start: toDo.startTime,
  //       end: toDo.endTime,
  //       backgroundColor: calculateColor(toDo.startTime, toDo.endTime),
  //       borderColor: calculateColor(toDo.startTime, toDo.endTime),
  //       extendedProps: {
  //         content: toDo.content // 이벤트에 상세 내용 포함
  //       }
  //     })),
  //     eventClick: function (info) {
  //       // 이벤트 클릭 시 상세 정보 표시
  //       setSelectedEvent({
  //         title: info.event.title,
  //         start: info.event.startStr,
  //         end: info.event.endStr,
  //         content: info.event.extendedProps.content
  //       });
  //     }

  //   });

  //   calendar.render();
  //   return () => calendar.destroy();
  // }, [toDos]);

  function calculateColor(start, end) {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
    // Linear interpolation between green (0%) and red (100%)
    const greenToRed = 255 * progress;
    return `rgb(${greenToRed}, ${255 - greenToRed}, 0)`;
  }

  const onChange = (e) => setToDo(e.target.value);
  const onDateChange = (e) => setDueDate(e.target.value);

  const onMinutesChange = (e) => {
    setMinutesToAdd(e.target.value);
  };
  const addMinutesToDate = (minutes) => {
    const now = new Date(); // 현재 시간을 가져옵니다.
    now.setMinutes(now.getMinutes() + minutes); // 현재 시간에 분을 더합니다.


    // Intl.DateTimeFormat을 사용하여 로컬 시간대의 날짜와 시간을 포맷팅합니다.
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZoneName: 'short'
    };
    let formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(now);

    // 포맷팅된 문자열에서 날짜와 시간을 추출합니다.
    const [datePart, timePart] = formattedDateTime.split(', ');
    const [month, day, year] = datePart.split('/');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    let formattedTime = timePart.slice(0, 5);
    let hours = parseInt(formattedTime.split(':')[0], 10);
    const minutesPart = formattedTime.split(':')[1];
  
    // "24:XX" 시간 처리
    if (hours === 24) {
      hours = 0; // 시간을 "00"으로 설정
      formattedTime = `${hours.toString().padStart(2, '0')}:${minutesPart}`;
    }
    console.log(now.toISOString());
    console.log(`${formattedDate}T${formattedTime}`);
    // 'YYYY-MM-DDTHH:mm' 형식으로 결합하여 반환합니다.
    return `${formattedDate}T${formattedTime}`;
  };

  const toggleMinuteOptions = () => {
    setShowMinuteOptions(!showMinuteOptions);
  };


  const handleQuickAddMinutes = (minutes) => {
    setDueDate(addMinutesToDate(minutes));
  };

  const handleAddCustomMinutes = () => {
    if (minutesToAdd) {
      setDueDate(addMinutesToDate(parseInt(minutesToAdd, 10)));
      setMinutesToAdd('');
    }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (toDo === "" || dueDate === "") {
      return;
    }
    const now = new Date();
    const newTask = {
      task: toDo,
      dueDate,
      resource_content: resource_content, // 할 일에 상세 내용 추가
      content: content, // 할 일에 상세 내용 추가
      startTime: now.toISOString(),
      endTime: dueDate,
      isCompleted: false,
      percentage: 0
    };
    setToDos(currentArray => [newTask, ...currentArray]);
    setToDo("");
    setDueDate("");
    setResoucrContent("");
  }
  const toggleCompleted = (index) => {
    setToDos((currentToDos) =>
      currentToDos.map((item, i) => {
        if (i === index) {
          return { ...item, isCompleted: !item.isCompleted };
        }
        return item;
      })
    );
  };
  const deleteTodo = (index) => {
    setToDos((currentToDos) =>
      currentToDos.filter((_, i) => i !== index)
    );
  };

  let dragSrcEl = null; // Drag 시작 항목
  function downloadTodos() {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(toDos, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "todos.json";
    document.body.appendChild(element); // 필요한 경우에만 Firefox에서의 지원을 위해 추가
    element.click();
    document.body.removeChild(element); // 필요한 경우에만 Firefox에서의 지원을 위해 추가
  }
  function loadTodos(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const todos = JSON.parse(e.target.result);
        setToDos(todos);
      };
      reader.readAsText(file);
    }
  }

  function handleDragStart(e, index) {
    dragSrcEl = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
  }

  function handleDragOver(e) {
    e.preventDefault(); // 드롭을 허용하기 위해 필요
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, index) {
    e.stopPropagation(); // 드롭 이벤트가 상위 요소로 전파되지 않도록 합니다.

    if (dragSrcEl !== null && dragSrcEl !== undefined && index !== undefined) {
      const updatedToDos = [...toDos];
      const draggedItem = updatedToDos[dragSrcEl];

      // 드래그한 항목이 유효한지 검사합니다.
      if (draggedItem) {
        updatedToDos.splice(dragSrcEl, 1); // 원래 위치에서 항목 제거
        updatedToDos.splice(index, 0, draggedItem); // 새 위치에 항목 삽입

        // 각 항목의 isCloseToDue 상태를 업데이트합니다.
        const now = new Date();
        const updatedItems = updatedToDos.map(item => {
          const due = new Date(item.dueDate);
          const isCloseToDue = (due - now) < 0; // 마감 시간이 지났는지 여부를 계산합니다.
          return { ...item, isCloseToDue };
        });

        setToDos(updatedItems);
      }
    }

    return false;
  }
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setToDos((currentToDos) =>
        currentToDos.map((item) => {

          const due = new Date(item.dueDate);
          const start = new Date(item.startTime).getTime();
          const end = new Date(item.dueDate).getTime();
          const elapsed = now - start;
          const timeDifference = due - now;
          const minutesRemaining = Math.floor(timeDifference / 1000);
          const total = end - start;
          const isCloseToDue = minutesRemaining < 0;
          const percentage = Math.min(100, Math.max(0, (1 - (timeDifference / (due - new Date(item.startTime)))) * 100));

          console.log(isCloseToDue)

          return { ...item, minutesRemaining, isCloseToDue, percentage };


        })
      );
    }, 1000); // 1 minute interval

    return () => clearInterval(interval);
  }, []);
  const [select_index, setIndex] = React.useState("seconds");
  const onSelect = (event) => {
    setIndex(event.target.value);
  }
  return (
    <div>
      <h1>To Do List ({toDos.length})</h1>
      <button className="form-button" onClick={toggleToDoVisibility} type="button">
        {isToDoVisible ? 'Hide To Do' : 'Add To Do'}
      </button>
      <input type="file" id="fileInput" class="custom-file-input" onChange={loadTodos} />
      <label for="fileInput" class="file-input-label">Load Todos</label>

      {isToDoVisible && ( // Conditional rendering based on state}
        <form onSubmit={onSubmit} className="form-container">
          <div className="form-row">
            <input
              className="form-input"
              value={toDo}
              onChange={onChange}
              type="text"
              placeholder="Write your to do"
            />
            <input
              className="form-input"
              value={dueDate}
              onChange={onDateChange}
              type="datetime-local"
            />


            <button className="form-button" onClick={toggleContentVisibility} type="button">
              {isContentVisible ? 'Hide Details' : 'Add Details'} {/* Toggle button text */}
            </button>

            <button type="button" className="form-button" onClick={toggleMinuteOptions}>
              {showMinuteOptions ? 'Hide Options' : 'Add Minutes'}
            </button>

            <button className="form-button" type="submit">Add To Do</button>
          </div>
          {showMinuteOptions && (
            <div className="form-row options-row">
              <input
                className="form-input"
                value={minutesToAdd}
                onChange={onMinutesChange}
                type="number"
                placeholder="Custom minutes"
              />
              <button type="button" className="form-button" onClick={() => handleQuickAddMinutes(10)}>+10m</button>
              <button type="button" className="form-button" onClick={() => handleQuickAddMinutes(20)}>+20m</button>
              <button type="button" className="form-button" onClick={() => handleQuickAddMinutes(30)}>+30m</button>
              <button type="button" className="form-button" onClick={handleAddCustomMinutes}>Add</button>
            </div>
          )}
          {isContentVisible && ( // Conditional rendering based on state
            <div className="form-row">
              <input
              className="form-input"
              value={resource_content}
              onChange={onChangeResourceContent}
              type="text"
              placeholder="Write your TAGS"
            />
              <textarea
                className="form-input"
                value={content}
                onChange={onChangeContent}
                placeholder="Add more details"
                style={{ resize: "none", height: "100px" }}
              ></textarea>
            </div>
          )}

        </form>
      )}
      <div className="form-row">
        <select class="form-select" value={select_index} onChange={onSelect}>
          <option value="days">Days</option>
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
        <button className="form-button" onClick={downloadTodos} >Download Todos</button>
      </div>
      {toDos.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: item.isCloseToDue ? '#ffebee' : '#f9f9f9',
            color: item.isCloseToDue ? '#d32f2f' : 'inherit',
            textDecoration: item.isCloseToDue ? 'line-through' : 'none',
            cursor: 'move',
          }}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{index + 1}.</span>
            <input
              type="checkbox"
              checked={item.isCloseToDue}
              onChange={() => toggleCompleted(index)}
              style={{ marginRight: '10px' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{item.task}</p>
              {!item.isCloseToDue ? (
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  {select_index === "seconds" ? `Due in ${Math.floor(item.minutesRemaining)}s` :
                    select_index === "minutes" ? `Due in ${Math.floor(item.minutesRemaining / 60)}m` :
                      select_index === "hours" ? `Due in ${Math.floor(item.minutesRemaining / (60 * 60))}h` :
                        select_index === "days" ? `Due in ${Math.floor(item.minutesRemaining / (60 * 60 * 24))}d` : null}
                </span>
              ) : (
                <span style={{ fontSize: '0.85em', color: '#d32f2f' }}>Terminated</span>
              )}
            </div>
            <button onClick={() => deleteTodo(index)} style={{
              marginLeft: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}>Delete</button>
          </div>
          {/* 진행 상태 바 추가 */}
          <div style={{ height: '10px', width: '100%', backgroundColor: '#ddd', borderRadius: '5px' }}>
            <div style={{
              height: '100%',
              width: `${item.percentage}%`,
              backgroundColor: item.percentage >= 100 ? '#d32f2f' : '#4caf50',
              borderRadius: '5px',
            }}></div>
          </div>
        </div>
      ))
      }
      <select onChange={handleViewTypeChange} value={viewType}>
          <option value="calendar">Calendar</option>
          <option value="gantt">Gantt Chart</option>
          <option value="gauge">Gauge Chart</option>
      </select>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {viewType === 'calendar' ? (
        <div style={{ flex: 7, marginRight: "20px" }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={toDos.map(todo => ({
              // id: todo.id,
              title: todo.task,
              start: todo.startTime,
              end: todo.endTime,
              backgroundColor: calculateColor(todo.startTime, todo.endTime),
              borderColor: calculateColor(todo.startTime, todo.endTime),
              extendedProps: {
                content: todo.content
              }
            }))}
            eventClick={(info) => {
              setSelectedEvent({
                title: info.event.title,
                start: info.event.startStr,
                end: info.event.endStr,
                content: info.event.extendedProps.content
              });
            }}
          />
        </div>
        ) : viewType === 'gantt' ? (
          <MyGanttChart tasks={toDos} />
        ) : viewType === 'gauge' ? (
          <TodosGaugeCharts tasks={toDos} />
        ) : null}
        <div style={{ flex: 3 }}>
          {selectedEvent && (
            <div>
              <h2>Selected Event Details</h2>
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Start:</strong> {selectedEvent.start}</p>
              <p><strong>End:</strong> {selectedEvent.end}</p>
              <p><strong>Content:</strong> {selectedEvent.content}</p>
            </div>
          )
          
          
          }
        </div>
      </div>
    </div >
  );
}

export default App;