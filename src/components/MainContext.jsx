import { useState, useRef, useEffect } from "react"
import { Helmet } from "react-helmet"
import Footer from "./Footer"
import PomodoroDesc from "./PomodoroDesc"

export default function MainContent() {
  const MODES = {
    pomodoro: { minutes: 25, seconds: 0, label: "Pomodoro", time: "25:00" },
    short: { minutes: 5, seconds: 0, label: "Short Break", time: "5:00" },
    long: { minutes: 15, seconds: 0, label: "Long Break", time: "15:00" },
  }

  const MODE_COLORS = {
    pomodoro: "bg-lightSoftTomato",
    short: "bg-softTomato",
    long: "bg-darkTomato",
  }

  const isMobile = () => /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const [mode, setMode] = useState("pomodoro")
  const [time, setTime] = useState(MODES.pomodoro)
  const [isRunning, setIsRunning] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)

  // Task Management State
  const [taskInput, setTaskInput] = useState("")
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState("")

  // New state to manage timer reset
  const [resetTimer, setResetTimer] = useState(false)

  const intervalRef = useRef(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const canvasCtxRef = useRef(null)

  // Load tasks from localStorage when the component mounts
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"))
    if (savedTasks) {
      setTasks(savedTasks)
    }
  }, [])

  // Store tasks in localStorage whenever the tasks list changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    } else {
      localStorage.removeItem("tasks")
    }
  }, [tasks])

  // Request mobile notification permission
  useEffect(() => {
    if (!isMobile() && "Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

  const handleNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.")
        } else {
          console.log("Notification permission denied")
        }
      })
    }
  }

  const sendNotification = (message) => {
    if (isMobile()) return

    if (!("Notification" in window)) return

    const sound = new Audio("/sound/ding.mp3")
    sound.play()

    if (Notification.permission === "granted") {
      new Notification(message, {
        icon: "/images/pomodoro-icon.webp",
        badge: "/images/pomodoro-icon.webp",
      })
    }
  }

  // Mode change handler
  const handleModeChange = (newMode) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setMode(newMode)
    setTime(MODES[newMode])
    setTimerFinished(false)
  }

  // Start timer
  const startTimer = () => {
    if (!isMobile()) {
      handleNotificationPermission()
    }

    if (isRunning) return
    setIsRunning(true)
    setTimerFinished(false)

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        const total = prev.minutes * 60 + prev.seconds

        if (total <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null

          // Notification
          sendNotification(`${MODES[mode].label} finished!`)

          setIsRunning(false)
          setTimerFinished(true)

          return { minutes: 0, seconds: 0 }
        }

        const next = total - 1
        return {
          minutes: Math.floor(next / 60),
          seconds: next % 60,
        }
      })
    }, 1000)
  }

  // Pause timer
  const pauseTimer = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
  }

  // Reset timer
  const resetTimerFunction = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setTimerFinished(false)
    setTime(MODES[mode])
  }

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => {
      setError("")
    }, 3000)
  }

  // Add task
  const addTask = () => {
    const value = taskInput.trim()

    if (!value) {
      showError("Task cannot be empty")
      return
    }

    if (tasks.some((t) => t.text.toLowerCase() === value.toLowerCase())) {
      showError("This tasks already exists.")
      return
    }

    if (value.length > 30) {
      showError("Task is too long (max 80 characters).")
      return
    }

    setTasks([...tasks, { text: value, completed: false }])
    setTaskInput("")
  }

  // Toggle task complete
  const toggleComplete = (index) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // Remove task
  const removeTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex)
    setTasks(updatedTasks)
  }

  // Setup canvas + video stream for PiP
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    canvasCtxRef.current = ctx

    const stream = canvas.captureStream(30)
    video.srcObject = stream
    video.muted = true

    video.play().catch(() => {})

    drawOnCanvas(mode, time, canvas, ctx)

    return () => {
      const tracks = stream.getTracks()
      tracks.forEach((t) => t.stop())
    }
  }, [])

  // Redraw canvas when time or mode changes
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvasCtxRef.current
    if (!canvas || !ctx) return
    drawOnCanvas(mode, time, canvas, ctx)
  }, [time, mode])

  // SAFELY handle timer finished event (prevents mobile blank screen)
  useEffect(() => {
    if (!timerFinished) return

    const safeReset = async () => {
      // Reset time after DOM settles
      setTimeout(() => {
        setResetTimer(true) // Indicate that we need to reset the timer
      }, 60)

      // Prevent iOS crash: disable PiP exit on mobile
      setTimeout(() => {
        try {
          if (document.pictureInPictureElement) {
            // pause before exit to avoid crash
            const video = videoRef.current
            video.pause()
            document.exitPictureInPicture()
          }
        } catch (_) {}
      }, 300)
    }

    safeReset()
  }, [timerFinished, mode])

  // Reset timer after it's finished
  useEffect(() => {
    if (resetTimer) {
      setTimerFinished(MODES[mode]) // Reset the timer based on the mode
      setResetTimer(false) // Reset the flag after resetting the timer
    }
  }, [resetTimer, mode])

  const handleMiniPlayer = async () => {
    if (isMobile()) {
      alert("Mini-player is not supported on mobile devices.")
      return
    }

    const video = videoRef.current
    if (!video) return

    try {
      if (video.paused) await video.play()

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureElement) {
        await video.requestPictureInPicture()
      }
    } catch (err) {
      console.error("PiP error:", err)
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const formattedMinutes = String(time.minutes).padStart(2, "0")
  const formattedSeconds = String(time.seconds).padStart(2, "0")

  return (
    <>
      <Helmet>
        <title>{`${formattedMinutes}:${formattedSeconds}`} - Pomodoro</title>
      </Helmet>

      <header className={`py-3 px-4 md:pb-8 ${MODE_COLORS[mode]}`}>
        <div className="w-full flex justify-center pt-3 md:pt-0">
          <img
            className="max-w-[80px] md:max-w-[120px] w-100 animate-float"
            src="/images/pomodoro-app.webp"
            alt="Tomato"
          />
        </div>

        <div className="max-w-[1280px] m-auto">
          <section
            className={`${MODE_COLORS[mode]} max-w-[568px] m-auto py-8 rounded-lg`}
          >
            {/* Tabs */}
            <ul className="flex justify-center gap-2 mb-8">
              <li>
                <button
                  onClick={() => handleModeChange("pomodoro")}
                  className={`px-2 py-2 md:px-4 font-semibold rounded-sm whitespace-nowrap ${
                    mode === "pomodoro"
                      ? "bg-softTomato text-blue-50"
                      : "text-blue-50"
                  }`}
                >
                  Pomodoro
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleModeChange("short")}
                  className={`px-2 py-2 md:px-4 font-semibold rounded-sm whitespace-nowrap ${
                    mode === "short"
                      ? "bg-lightSoftTomato text-blue-50"
                      : "text-blue-50"
                  }`}
                >
                  Short Break
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleModeChange("long")}
                  className={`px-2 py-2 md:px-4 font-semibold rounded-sm whitespace-nowrap ${
                    mode === "long"
                      ? "bg-softTomato text-blue-50"
                      : "text-blue-50"
                  }`}
                >
                  Long Break
                </button>
              </li>
            </ul>

            {/* Timer */}
            <div className="text-center">
              <p className="text-6xl md:text-8xl text-white font-black">
                {formattedMinutes} : {formattedSeconds}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center mt-8 gap-4">
              {!isRunning ? (
                <button
                  className="bg-white px-[40px] py-3 uppercase font-semibold rounded-sm"
                  onClick={startTimer}
                >
                  Start
                </button>
              ) : (
                <button
                  className="bg-white px-[40px] py-3 uppercase font-semibold rounded-sm"
                  onClick={pauseTimer}
                >
                  Pause
                </button>
              )}

              <button
                className="bg-bisque text-white px-4 py-3 uppercase text-sm font-semibold rounded-sm"
                onClick={handleMiniPlayer}
              >
                Mini Player
              </button>
            </div>

            {/* Task Management */}
            <section className="mt-10 px-4">
              <div className="mx-auto w-full max-w-[640px] rounded-x1 border border-white/20 bg-white/20 backdrop-blur-sm shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
                  <h3 className="text-white text-lg font-bold tracking-wider">
                    Tasks
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 test-xs font-semibold text-white">
                    {tasks.length} {tasks.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/*Add Bar*/}
                <div className="flex flex-col gap-3 px-4 pb-4 md:flex-row md:px-6">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-white/30 bg-white/90 px-4 py-3 text-sm text-slate-800 placeholder-slate-500 shadow-sm outline-none transition focus:border-white focus:ring-2 focus:ring-white/50 capitalize"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="What do you want to get done?"
                      aria-label="Task name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask()
                      }}
                      maxLength={30}
                    />
                    {/*Subtle glow */}
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-lg blur"></div>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow hover:shadow-md active:scale-[0.98] transition"
                    onClick={addTask}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                    </svg>
                    Add Task
                  </button>
                </div>
                {error && (
                  <p className="text-red-100 text-sm mb-1 px-1 text-center pb-2">
                    {error}
                  </p>
                )}
                {/* Divider */}
                <div className="h-px bg-white/15 mx-4 md:mx-6" />

                {/* Lists */}
                <ul className="max-h-72 overflow-auto px-2 py-2 md:px-4 md:py-3 custom-scroll">
                  {tasks.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-white/80">
                      Your list is empty. Add a task to get started!
                    </li>
                  ) : (
                    tasks.map((task, index) => (
                      <li
                        key={index}
                        className="group mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3 md:px-4 md:py-3 text-white/95 shadow-sm transition hover:bg-white/10 hover:border-white/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-2 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-white/70 group-hover:bg-white"></span>

                            <span
                              className={`break-words leading relaxed ${
                                task.completed ? "line-through opacity-60" : ""
                              }`}
                            >
                              {task.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 transition group-hover:opacity-100">
                            {/*Mark as done*/}
                            <button
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/20 active:scale-95"
                              title="Done"
                              onClick={() => toggleComplete(index)}
                            >
                              ✓
                            </button>
                            {/* Remove Button */}
                            <button
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/20 active:scale-95"
                              onClick={() => removeTask(index)}
                              title="Remove"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </section>

            {/*Hidden PiP video + canvas*/}
            <video red={videoRef} className="hidden" playsInline />
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="hidden"
            />
          </section>
        </div>
      </header>

      <main>
        <PomodoroDesc />
      </main>
      <Footer />
    </>
  )
}

// Draw canvas content for PiP
function drawOnCanvas(mode, time, canvas, ctx) {
  const { width, height } = canvas
  const { minutes, seconds } = time

  ctx.fillStyle = "#D96F63"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#e5e7eb"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  ctx.font = "bold 20px system-ui"
  const modeLabel =
    mode === "pomodor"
      ? "Pomodoro"
      : mode === "short"
      ? "Short Break"
      : "Long Break"

  ctx.fillText(modeLabel, width / 2, height / 3)

  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")

  ctx.font = "bold 48px system-ui"
  ctx.fillText(`${mm}:${ss}`, width / 2, (height * 2) / 3)
}
