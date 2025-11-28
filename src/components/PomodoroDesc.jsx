import React from "react"

export default function PomodoroDesc() {
  return (
    <>
      <div className="max-w-[1280px] m-auto sm:px-4">
        <article className="max-w-[568px] m-auto pb-6 px-6 md:px-0">
          <h1 className="text-xl font-bold py-6">Pomodoro timer is here.</h1>
          <div className="max-w-[15px] bg-red-700 max-h-2" />
          <h2 className="mb-6 font-bold text-xl after:absolute after:w-10 after:h-1 after:bg-violetHorizon after:bottom-[-5px] after:left-0 relative">
            So, what exactly is the Pomodoro method?
          </h2>
          <p className="mb-5 leading-7 text-textColor">
            Think of Pomodoro as your secret weapon for getting things done.
            It's a straightforward but effective productivity tool that's
            perfect for any task, from hitting the books to writing or even
            coding. You can use it on your computer or phone, and it keeps you
            on track by encouraging you to focus intently and take regular
            breaks.
          </p>
          <p className="mb-5 leading-7 text-textColor">
            This timer is based on the famous{" "}
            <strong className="text-violetHorizon">Pomodoro Technique</strong>
            making it your go-to for boosting productivity.
          </p>

          <h2 className="mb-6 font-bold text-xl after:absolute after:w-10 after:h-1 after:bg-violetHorizon after:bottom-[-5px] after:left-0 relative">
            What is the Pomodoro Technique, anyway?
          </h2>
          <p className="mb-5 leading-7 text-textColor">
            It's a time management system created by Francesco Cirillo to help
            people work and study more effectively. The core idea is to break
            your work into focused bursts, usually 25 minutes long, called
            "pomodoros," followed by short breaks. This helps you stay sharp and
            avoid feeling overwhelmed.
          </p>
          <p className="mb-5 leading-7 text-textColor">
            The name <strong className="text-violetHorizon">"Pomodoro"</strong>{" "}
            comes from the Italian word for "tomato." Cirillo got the idea from
            a tomato-shaped kitchen timer he used when he was in college. Today,
            the Pomodoro Technique is a popular time management strategy,
            helping many people accomplish more while feeling less stressed.
          </p>

          <h2 className="mb-6 font-bold text-xl after:absolute after:w-10 after:h-1 after:bg-violetHorizon after:bottom-[-5px] after:left-0 relative">
            How to use the Pomodoro Timer?
          </h2>
          <ol className="list-decimal mb-6 text-textColor">
            <li className="ml-8 mb-3 before:content-['🍅'] before:mr-2 before:absolute before:-left-6 relative">
              <strong>Start timer</strong> and <strong>focus</strong> on the
              task for 25 minutes
            </li>
            <li className="ml-8 mb-3 before:content-['🍅'] before:mr-2 before:absolute before:-left-6 relative">
              <strong>Take a break</strong> for 5 minutes when the alarm rings
            </li>
          </ol>

          <h2 className="mb-6 font-bold text-xl after:absolute after:w-10 after:h-1 after:bg-violetHorizon after:bottom-[-5px] after:left-0 relative">
            <li className="ml-8 mb-3 before:content-['🍅'] before:mr-2 before:absolute before:-left-6 relative">
              <strong>Estimate Finish Time:</strong> Get an estimate of the time
              required to complete your daily tasks.
            </li>
          </h2>
        </article>
      </div>
    </>
  )
}
