import { sfxr } from 'jsfxr'
import Prando from 'prando'
import { exposeToWindow } from './func'

const sounds = {
  buttonClick:
    '111116HkiG8GujtEjnMJhFtLX29gkMY65EEdGAv59qX4c9RGzuuh6X9Ksy4ECgQMYR3nG5Z1voVqxoHujPPsCyZikXM9Z24b5e66hCfZpUG27zi5S4eEq687',
  buttonClick1:
    '7BMHBGTKXSgyaSLgfFzcva36QVoTsTyFWrUADWqzQPAscFQqdJjK9VGxHqydYZGFYyZyxxfhN3FeF5MyN4LgDR9q1sKEd29VHbLajLdLzYmmKRxQaJv3Y3YFy',
  playerStep:
    '5j2HNzxPsVwkQq8deQeApTBjEhBEZUXiR8jvcthLjrTfuCMAbHANbqK76i8JPGc7KveFTA2JcQ2gMTeW6FzxKyAVgkmE3x2ojDNc5w5CkQNZv8cYmvoqoqxtL',
  switch:
    '34T6PkjaMBkUec9927LwnnDjWqw5zLxZaAuRR4xrB9dcbKhhzgBwnvEwba6Z65juKTyzs4DjwB9WH5i55UVSLFhj8JtoKsBM4D9RGymHV9S82ggXRXkbryVdR',
  typeWord:
    '5j2HNzxPsVwkQq8deQeApTA9rxovcc3udy6488WEkeCxDnYRBA8YaqgEYKmxHeebALYwGouNZfMsVSqSiXMpY9pf3B7GNdpuFKqYrZN9xL7PX3P2dN6iBMTE4',
  startLevel:
    '7ABKttmRYHkZnquMXPvizHDt9ZcJVnuw2nxcGG9zcqWfGMFv8J9FsicGQtzdK84bq1KU4AeJuNGwhZXnhyxpzWcja5vbirPCD8iH7dwSL3NvjKSJYrFtHJ9oh',
  startLevel2:
    '1111111UE5Ca6xvuT3DoqngwzKTqr7M1JdTBPg36VpCDLrHNdJz4aA8SPJzoCnRbTakVDTEzAgkusF9zByahX9LJ9mXsNrhLho65cd66AGqH5y5gWqg1f49',
  portalEntered:
    '7ABKttmRYHkZnquMXPvizHDt9ZcJVnuw2nxcGG9zcqWfGMFv8J9FsicGQtzdK84bq1KU4AeJuNGwhZXnhyxpzWcja5vbirPCD8iH7dwSL3NvjKSJYrFtHJ9oh',
  portalEntered0:
    '57uBnWcNEpWbmcuZ5forz9MpfYENJdvJjQDoAX8Hkc2NBKraVdcYAN1LF5t3zLTqF6T38UkvVeMJvxppqsdN6fttRJbu7nuL9W9fkRXcfHH5xweywEVWCjJ8f',
  portalEntered2:
    '4zxShzdyy4vpdUg1jaDnm9MCDnRwGngMpaW9DW3duJDWEHmGrZwE3VUvPSdxUo1cjm5ZawpLXqYWXEdR2jxccBKwLEH6eJN5eeHXaSRTfR5kcB3CKTzcL2ZN4',
  portalEntered3:
    '8YeU5AdF98truR6iUqmF3Nj8aiMKv2i3iwfsyzuZ2hCEiQehcjT4U8TfyKehgDvSZN5FS7YRKwH5MXYYBzzLfS6c1GWxDYTV65GGim71muYiAYRQTGsSaGHtj',
  diamondPickup:
    '4EHBGKMDZQqfETMe5PLGykKVwduozWo2Cg3r6BwTXSGx52XhacWDwprwjrUGgpwoWKMLFJkiEJEC42xm382wq5TGRHwmJkoUdH9h6RJxhAqoSLrAWbFJQxZjH',
  funnyGhost:
    '57uBnWSDsngoDvqpXFLsyfdLLQc9ZFXrnVLM1mt4DmsdQSb7TmwutV4SXq2exUVVLUGYKinLmPkD3Lo9o8Ch6uhesi7HkE8ow8ax2jVAhsT6iwCA1rJs6JojD',
  explosion:
    '7BMHBGLvFBi4QB9FgDeaxqzbERzVXT9LZqir22w8x3jQZBsQ7rmAssAQNHLyuw8EJsHFgc1hCYdgpdYdtTodCcGaif7GQnnRq5wzhCS7SDSLkY3BLYGmYrUNT',
  explosion2:
    '8yFLc3YsBs5xsDtFmi7CdTTjgskPcMrULqbJn1JZ1tENjPyVR7pDK8kEeMwghkk4V4tBnuxx5GsQpVeZoqTJkLgr6HoKKdgwYVYgWTUc3rxdVAFsPKH8peyhv',
  collect:
    '111112UXmN6BdMjfWdCnngZqu4pVwX7FkhM7vknvzZhHkv4s51vmc5LpT2W9qxNSCtM6A77pZWH3cqTYShKmdaG6z4BbB6xGyG1sy39w18PsBNKQCv4euYW3',
  collect2:
    '1111111112zSxL3nAz6w6NBEe3HvJRqTjuERdZvpy7S3TKgYnGe1giMiKy9urx3vTNVMfAZu2YseyjCPTsaVJaNaSZ7DzBwAuxNaVqvWKNNi43GGYbGYu2o',
  collect3:
    '1ADQDCJZxJZ7Bjafz5NnLKyrrUTcHoHURrd29jgydTFNUAYnjZL31aPVFssZwdTiLFnrwKUxFRXq3p1mEwhN46FLx6n4Bjrj9mbRvft7sy4EDP4fyzJi2HzB6',
  collect4:
    '12SE1sPKbd42oyrYEx5ifqimvJ9moFTQveo5UXf4kRUVcBneBoGpGs8tP2HmaCYAwfFXtTZzeR8WZFqDNEgJNQcDDV4dCU1XJQX3PYpmqXCHQT4MvAXRnUTngs',
  collect5:
    '12SE1sPKbd42oyrYEx5ifqimvJ9moFTQveo5UXf4kRUVcBneBoGpGs8tP2HmaCYAwfFXtTZzeR8WZFmd4BK4Ci79PkCznb52yQ2d8ap8P2qrKzcanrgfqwcTHV',
  spring:
    '12SE1sPKbd42oyrYEx5ifqimvJ9moFTQveo5UXf4kRUVcBneBoGpGs8tP2HmaCYAwfFXtTZzeR8WZFuh8ESEYum3KY9VvXVP7hNdSDxW8vqo7mb96N894fj9pf',
  coolJump:
    '12qDizi2w4UwnAhLj5hVCGcNA9FAqAEzj4ofG3s81pVTbANM9TBJmWD9ACj2Y6CjR2iJZAY6cm3H4y6zdEQdQqW1mcfaADJU2dypkmLT7f3uTB1yxAF8SXPuQ7',
  coolJump2:
    '12qDizi2w4UwnAhLj5j1yWB4FjwEiqM58fnmRAmwPSorxPbSe9sCm3WtGsVvVjStAMjUZFvdgDYnU9dJ3hXsoJ7RPNr8hKhTnncPEn72ezTjVgi221g57GYqBq',
  waterDive:
    '6x7unDU9voQV5LPtRTo4Luqoz5HZNhEEoJniaawLVBK8mqUrkqdmjmqkMQv8FyMED83kRryAKeAbbfDCfH86fJgDUur1Tpa9JNUqqmarjQpMwhkzqjHLPrnJf',
  waterDive2:
    '6x7unDU9voQV5LPtRTo4Luqoz5HZNhEEoJniaawLVBK8mJt1tkYZSdVampn6QemdBctyQfsgEhW24uAxfEcUWwJmaSpdSMwP8g4aQzE6HrtNLehntGVSBqiYs',
  rocketLaunch:
    '12qDizi2w4UwnAhLj5zAAQVvVHTtPd24A2Tbjtq1eaBdHVBtRwCkB4NwngiqKMmarm1SnTsspxEwvGcq3uexLo78WCC36dvZh954N4F7vmoNZKAe2tHM1LegHh',
  actionAttack:
    '5k1PoSkMZxKse3PmDSsMHSXnChNtataQTAfxM9JF2gQrK83yQjvojzMb3F9Sy5cb8SpqbEECoCmw7gEnv4WAoxXeywEJ8tnrGfdHxrYr7XqK3MV3s3ikRXxd9',
  levelPass:
    '57uBnWiTMivkyGkzbUpoN1gyyJSitvnbFpdvEusXaYk9jUcghTWDRpjzjd5Hxphh58VJpd7eRJZUBWv3LnosuXdtbwjpWzJ2iwZpzVCJXA3hw9Y1T4ZrRH66B',
  // share: https://pro.sfxr.me/?s=1111111112zSxL3nAz6w6NBEe3HvJRqTjuERdZvpy7S3TKgYnGe1giMiKy9urx3vTNVMfAZu2YseyjCPTsaVJaNaSZ7DzBwAuxNaVqvWKNNi43GGYbGYu2o&r=44100&b=8&v=0.064&p=pickupCoin
}

const VOL_OVERRIDES: Partial<Record<TSoundName, number>> = {
  levelPass: 0.05,
  // playerStep: 0.2,
}

export type TSoundName = keyof typeof sounds
export type TSoundFx = { play: () => void; setVolume: (vol: number) => void }

const generateSounds = () => {
  let _sfxrSounds = {} as Record<TSoundName, TSoundFx>
  Object.keys(sounds).map((key, ind) => {
    const soundCode = sounds[key]
    _sfxrSounds[key] = sfxr.toAudio(soundCode)
    VOL_OVERRIDES[key] && _sfxrSounds[key].setVolume(VOL_OVERRIDES[key])
  })
  return _sfxrSounds
}

const SFXR_SOUNDS = generateSounds()
exposeToWindow({ SFXR_SOUNDS })

export const setSoundFXVolume = (vol: number) => {
  const patchedVolumeMultiplierFor = {
    startLevel: 1 / 0.05,
  }
  Object.values(SFXR_SOUNDS).forEach((s) => s.setVolume(vol))
}

export const playSound = (sound: TSoundName) => SFXR_SOUNDS[sound].play()
export const playRandomSound = (sounds: TSoundName[]) =>
  SFXR_SOUNDS[new Prando().nextArrayItem(sounds)].play()

exposeToWindow({ playSound })

// initial config
setSoundFXVolume(0.1)
