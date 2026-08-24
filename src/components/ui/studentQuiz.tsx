import {useState} from "react";
import {toast} from "sonner";
import { CircleCheckBig } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
const Question = [ 
  {
    question : "What does HTML stand for?",
    options :[
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "Highly Typed Markup Language"
    ],
    answer : "Hyper Text Markup Language"
  },
  {
    question : "Which language is used for styling web pages?",
    options :[
      "HTML",
      "JQuery",
      "CSS",
      "XML"
    ], 
    answer : "CSS"
  },
  {
    question : "Which is not a JavaScript Framework?",
    options :[
      "Python Script",
      "JQuery",
      "Django",
      "NodeJS"
    ],
    answer : "Django"
  },
  {
    question : "Which is used for Connect To Database?",
    options :[
      "PHP",
      "HTML",
      "JS",
      "All"
    ],
    answer : "PHP"
  },
  {
    question : "Which CSS property is used to change text color?",
    options :[
      "color",
      "background-color",
      "text-color",
      "font-color"
    ],
    answer : "color"
  }
];

 export const StudentQuiz = ()=>{
  const [currentQuestion, setQuestion]= useState(0);
  const [selectAns, setSelectAns]= useState<Record<number,string>>({});
 
  const [submit, setSubmit]= useState(false);
  const [error, setError]= useState('');

      useEffect(() => {
      if (submit) {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });
  }
}, [submit]);

   const handleSelect = (option:string)=>{
     setSelectAns((prev)=> ({...prev, [currentQuestion]:option}));
     setError('');
   }

   const handlePrevious = ()=>{
    setError('');
    if(currentQuestion >0){
      setQuestion((prev)=> prev-1);
    }
   }

   const handleNext= ()=>{
    setError('');
    if(!selectAns[currentQuestion]){
        toast.error('Please select an answer before proceeding.');
      return;
    }
    setQuestion((prev)=> prev+1);

   }

   const handleSubmit =  ()=>{
    if(!selectAns[currentQuestion]){
      toast.error('Please select an answer before submitting.');
      return;
    }
    setSubmit(true);
   }


  const progress = ((currentQuestion+1)/ Question.length)*100;
  const question = Question[currentQuestion];
 
const score= Question.filter((i,index)=>
  selectAns[index]=== i.answer
).length
   
  
  const handleRestart= ()=>{
    setQuestion(0);
    setSelectAns({});
    setSubmit(false);
    setError('');
  }

  if(submit){
    return(
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
  <CircleCheckBig
    size={64}
    className="text-green-500"
    strokeWidth={2}
  />
</div>
          <h2 className= "text-3xl font-bold text-gray-900 ">Quiz Completed</h2>
           <p className="mt-3 text-gray-600">Great job! Here is your result.</p>
           <div className="my-8 rounded-2xl bg-gray-100 p-6">
            <p className="text-sm font-medium text-gray-500">YOUR SCORE</p>
            <p className="mt-2 font-bold text-5xl text-blue-600">{score}/{Question.length}</p>
           </div>
           <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={handleRestart}>Try Again</button>
      </div>
    )
  }

  return(
    <div className=" w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-lg md:p-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold text-gray-900">Student Quiz</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{
            currentQuestion + 1
          }/{Question.length}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{width:`${progress}%`}}></div>
        </div>

        <div>
          <p  className="mb-6 text-xl font-semibold text-gray-900">Question {currentQuestion +1}</p>
          <h3 className="mb-6 text-xl font-semibold text-gray-900">{question.question}</h3>
          <div className="space-y-3">{question.options.map((option,index)=>{
            const isSelected = selectAns[currentQuestion] === option;
           
            return(
              <button key={option} onClick={()=> handleSelect(option)}
              className={`flex w-full items-end gap-4 rounded-xl border p-4 text-left transition focus:outline focus:ring-2 focus:ring-blue-500 ${isSelected ? 'border-blue-600 bg-blue-50':'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'}`} >
                <span className={`flex h-6 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${isSelected ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600'}`}
                >{String.fromCharCode(65 + index)}</span>
                <span className="font-medium text-gray-800">{option}</span>
              </button>
            )
          })
            }</div>
            {error && (
              <p className=" mt-4 text-sm font-medium text-red-600">{error}</p>
            )}
          </div>
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <button onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
              Previous
            </button>
            {currentQuestion === Question.length -1 ? (
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onClick={handleSubmit}>Submit Quiz</button>
              ):(
                <button className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleNext}>
                  Next
                </button>
              )}
          </div>
      </div>
    </div>
  )

}