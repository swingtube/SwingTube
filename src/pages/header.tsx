function Header() {
    return (
        <>
        {/* <div className='w-full h-5 bg-black'></div> */}
        <header className="relative h-[300px] w-full bg-cover bg-center text-white" style={{ backgroundImage: `url('/swing_feet.png')` }}>
            {/* Capa oscura encima de la imagen */}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">SwingTube</h1>
                <p className="mt-2 text-lg md:text-xl text-muted-foreground text-white/80">
                Montajes de Swing
                </p>
            </div>
        </header>
        </>
    )
}


export default Header;
