import type { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import { prisma } from "../lib/prisma";
import { useRouter } from "next/router";
interface FormData {
  title: string,
  content: string,
  id: string
}

interface Notes{
  notes: {
    id: string,
    title: string,
    content: string
  }[];
}

const Home = ({notes}: Notes) => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({title: "", content: "", id: ""})
  const refreshData = () => {
    router.replace(router.asPath)
  }
  async function create(data: FormData){
    try {
      fetch('http://localhost:3000/api/create', {
        body: JSON.stringify(data),
        headers : {
          'Content-Type' : 'application/json'
        },
        method: "POST"
      }).then(() => {
        if(data.id){
          deleteNote(data.id)
          setForm({title: '', content: '', id: ''})
          refreshData()
        }else {
          setForm({title: '', content: '', id: ''})
          refreshData()
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

 async function deleteNote(id: string) {
  try {
    fetch(`http://localhost:3000/api/note/${id}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: "DELETE"
    }).then(()=> {
      refreshData()
    })
  } catch(error) {
    console.log("cant")
  }
 }

  const handleSubmit = async (data: FormData) => {
    try {
      create(data)
      console.log(data)
    } catch(error) {
      console.log(error)
    }
  }
  return (
    <div className="flex flex-col space-y-2 w-8/12 mx-auto mt-16">
      <h1 className="text-center font-bold text-4xl text-white mb-20">CRUD Nextjs With Prisma</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-start justify-center">
        <form onSubmit={e => {e.preventDefault(), handleSubmit(form)}} className="w-96 space-y-6 border border-white p-6 rounded-xl flex flex-col items-stretch">
          <input className="border border-gray-500 rounded-md bg-transparent text-white placeholder:text-gray-200 pl-2" type="text" placeholder="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
          <textarea className="border border-gray-500 rounded-md bg-transparent text-white placeholder:text-gray-200 pl-2" placeholder="content" value={form.content} onChange={e => setForm({...form, content: e.target.value})}/>
          <button type="submit" className="w-full bg-blue-700 text-white rounded-xl py-2">Add</button>
        </form>
        <div className="space-y-10 px-4 py-6 rounded-xl w-full border">
            <ul>
              {notes.map(note => (
                <li key={note.id}>
                  <div className="flex justify-between border-b mb-4">
                    <div className="flex-1 text-white">
                      <h1 className="font-bold">{note.title}</h1>
                      <p className="text-sm">{note.content}</p>
                    </div>
                    <div className="flex flex-row gap-x-2">
                      <button className="px-4 py-2 rounded-lg bg-orange-300 text-white" onClick={()=> setForm({title: note.title, content: note.content, id:note.id})}><svg className="w-4 h-4 bg-transparent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                      <button className="px-4 py-2 rounded-lg bg-red-400 text-white" onClick={()=> deleteNote(note.id)}><svg className="w-4 h-4 bg-transparent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const notes = await prisma.note.findMany({
    select : {
      title: true,
      id: true,
      content: true
    }
  })

  return {
    props: {
      notes
    }
  }
}