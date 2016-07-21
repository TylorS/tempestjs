import { Source } from '../interfaces'
import { Stream } from '../Stream'
import { Multicast } from '../multicast/Multicast'

export function getSource<T> (stream: Stream<T>): Source<T> {
  return stream.source instanceof Multicast
    ? (stream.source as Multicast<T>).source
    : stream.source
}