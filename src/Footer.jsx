import { version, author } from '../package.json';
import { BugFill, Github } from 'react-bootstrap-icons';

export default function Footer() {  
    return (
        <footer className='w-full bg-gray-100 dark:bg-gray-800 mt-auto p-4'>
            <p className='text-center'>Kompendium DW v.{version} by {author.name}</p>
            <p className='text-sm my-2 text-gray-800 dark:text-gray-400 text-center'>Warhammer 40,000, Warhammer 40,000 Role Play, Deathwatch i wszystkie wykorzystane związane z nimi nazwy, ikony i obrazki są własnością intelektualną Games Workshop Limited lub innych autorów, z którymi autor aplikacji nie ma powiązania.</p>
            <div className="flex justify-center">
                <a className="" href="https://github.com/Qesting/qesting.github.io">Repozytorium GitHub<Github className='inline-block relative bottom-0.5 ml-1'/></a>
                <a className="ml-10" href="https://github.com/Qesting/qesting.github.io/issues">Zgłaszanie błędów i poprawek<BugFill className='inline-block relative bottom-0.5 ml-1'/></a>
            </div>
        </footer>
    )
}