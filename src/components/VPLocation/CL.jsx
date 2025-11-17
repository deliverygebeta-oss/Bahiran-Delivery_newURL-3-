import AnimatedCircles from './circles'; // Adjust path as needed

function CL() {
  // The relative positioning on the main container is crucial
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Your main page content goes here */}
      {/* <main className="p-8">
        <h1>Welcome to My Landing Page</h1>
        <p>This is where your great content lives.</p>
        {/* ... more content */}
      {/* </main> */}

      {/* This is the container for the circles. 
        It's positioned absolutely and constrained to the bottom right quadrant.
        You can adjust `w-1/3` and `h-1/3` to change the spread area.
      */}
      {/* <div className="absolute bottom-0 right-0 w-1/3 h-1/3">
        <AnimatedCircles />
      
      </div> */}
    </div>
  );
}

export default CL;