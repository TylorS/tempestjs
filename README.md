# Tempest

Tempest is a streaming library built for speed, ease-of-use, and for
[Cycle.js](https://github.com/cyclejs/cyclejs). This library takes the ideas of
other libraries and builds upon them, namely
[most.js](https://github.com/cujojs/most) and
[xstream](https://github.com/staltz/xstream). I owe them everything!

## I've come here to...

- [File an issue](https://github.com/TylorS/tempest/issues/new)
- [Contribute a fix/addition](#contributing)
- [Read the docs](#api)

## Why Tempest?

It's a tough question to answer.

##### Why not XStream? Its a great library

If you're coming to Cycle.js odds are you are going to be pointed in the
direction of learning and using xstream. Staltz (and a much lesser extent I too)
built xstream 100% with focus on Cycle.js! We analyzed and studied real-world
Cycle.js applications and figured out what the majority of use cases were, and
implemented only those as 'core' operators. 

Its a step in the right direction, but I feel it still leads itself to being 
inflexible when you don't have a'majority' use case. I myself have tried 
rewriting xstream twice, but have notbeen able to strike the perfect balance I 
and Staltz were hoping for.

If XStream meets all your requirements please continue to use it, its a great 
library by a very talented developer, that is being battle tested more and more 
each day. 

##### Why not Most.js? Its a great library

That's a bit of a trick question!

So I've been a contributor to [most.js](https://github.com/cujojs/most) for a 
good amount of time, and I find it to be extremely well architected, as well as 
incredibly fast. If you take a look at the internals of most, and the internals 
of Tempest, you'll find them stunningly similar. So similar in fact, that it 
should be 100% compatible with most. See: http://www.webpackbin.com/VkwyeWuwW 

This is totally on purpose. When most is rewritten to ES2015 in
the future, I'll actually be cutting out a whoooole lot of code here from 
Tempest by leveraging tree-shaking to extract the parts of most that I'm 
basically just copying from javascript to typescript.

For those wondering, UnicastStream here in Tempest, is actually just a most.js
Stream! The only reason it's not using most directly right now is because of 
the desire to keep things nice and small. Importing just Stream from most right 
now will still bring in 100% of the library.

##### Okay, so enough back story, really why this thing? 

Let me list my requirements I had when writing this thing 

-  most.js architecture - blazing-fast, maintainable, and compatibility.
-  xstream semantics - asynchronous stop, smart Cycle-related defaults, multicast by default
-  xstream operator names - fold, drop, etc
-  functional API - `map(f, stream)` instead of only `stream.map(f)` 
-  Cold/Unicast Streams are possible, but not default - XStream has *only* multicast streams, most defaults to unicast
-  super super modular - pick and choose *only* what you need
-  tree-shaking compatible
-  no shame! - e.g. `stream.shamefullySendNext()` from xstream
-  TypeScript - Seriously, use it.
-  ES Draft Observable interop

List of things I've kept in mind, but haven't implemented yet

-  Helpful error messages - think Elm compiler type helpful
-  Seriously debuggable - More on this in the future

Basically, I wanted to find a no compromise way to write the applications I need 
while also trying to be developer friendly and ergonomical. 

Lastly, and most importantly, its a lot of fun to write these things. The 
learning involved is tremendous, beneficial, and worthwhile.

## API

More on the API in the future, in the meantime the most.js wiki pages for
[Concepts](https://github.com/cujojs/most/wiki/Concepts) and 
[Architecture](https://github.com/cujojs/most/wiki/Architecture) can be quite 
eye-opening.

## Contributing

Contributions are the great, and I'd like to foster and accept all of it that I 
can, but to keep things smooth I need a little bit of help to do it!

Seriously all that I can ask is make your additions/fixes and use `npm run commit` 
instead of using `git commit` this gives us awesome commit messages that allow 
the generation of changelogs and for me to use semantic release to manage many 
small packages.